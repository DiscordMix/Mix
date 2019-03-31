import Log from "./log";
import DiscordEvent from "./discordEvent";
import Bot from "./bot";
import {BotState, BotEvent} from "./botExtra";
import {Message} from "discord.js";
import {title, debugMode} from "./constants";
import BotMessages from "./messages";
import {PromiseOr} from "@atlas/xlib";
import {performance} from "perf_hooks";
import FragmentLoader from "../fragments/fragment";

export interface IBotConnector {
    setup(): PromiseOr<this>;
}

export default class BotConnector implements IBotConnector {
    protected bot: Bot;
    protected setupStart!: number;

    public constructor(bot: Bot) {
        this.bot = bot;
    }

    /**
     * Setup the bot.
     */
    public async setup(): Promise<this> {
        this.bot.emit(BotEvent.SetupStart);

        // Display the project title (if applicable).
        if (this.bot.options.showAsciiTitle) {
            console.log("\n%s\n", title.replace("{version}", "beta"));
        }

        if (debugMode) {
            Log.info("Debug mode is enabled");
        }

        // Begin measuring performance.
        this.setupStart = performance.now();

        // Load languages.
        if (this.bot.i18n && this.bot.languages) {
            for (const lang of this.bot.languages) {
                await this.bot.i18n.load(lang);
            }
        }

        this.bot.emit(BotEvent.LoadingInternalFragments);

        const fragmentLoader: FragmentLoader = new FragmentLoader(this.bot);

        // Load & enable internal fragments.
        const internalFragments = await fragmentLoader.loadInternal();

        this.bot.emit(BotEvent.LoadedInternalFragments, internalFragments || []);
        this.bot.emit(BotEvent.LoadingServices);

        // Load & enable services.
        await fragmentLoader.loadServices();

        this.bot.emit(BotEvent.LoadedServices);
        this.bot.emit(BotEvent.LoadingCommands);

        // Load & enable consumer command fragments.
        await fragmentLoader.loadCommands();

        this.bot.emit(BotEvent.LoadedCommands);

        // Begin loading & enabling tasks. First, unregister all existing ones.
        await fragmentLoader.loadTasks();

        this.bot.emit(BotEvent.LoadedTasks);

        // Start the optimizer (if applicable).
        if (this.bot.options.useOptimizer) {
            Log.verbose(BotMessages.SETUP_START_OPTIMIZER);
            this.bot.optimizer.start();
            Log.success(BotMessages.SETUP_STARTED_OPTIMIZER);
        }

        // Setup the Discord client's events.
        this.setupEvents();

        Log.success(BotMessages.SETUP_COMPLETED);

        return this;
    }

    /**
     * Setup the client's events.
     */
    protected setupEvents(): void {
        Log.verbose("Setting up Discord events");

        // Discord client events.
        this.bot.client.on(DiscordEvent.Ready, async () => {
            // Setup temp module.
            this.bot.temp.setup(this.bot.client.user.id);

            // Create the temp folder.
            await this.bot.temp.create();

            if (this.bot.options.useConsoleInterface && !this.bot.console.ready) {
                // Setup the console command interface.
                this.bot.console.setup(this.bot);
            }

            Log.info(`Logged in as ${this.bot.client.user.tag} | ${this.bot.client.guilds.size} guild(s)`);

            const took: number = Math.round(performance.now() - this.setupStart);

            Log.success(`Ready | Took ${took}ms | PID ${process.pid}`);
            this.bot.setState(BotState.Connected);
            this.bot.setSuspended(false);
            this.bot.emit(BotEvent.Ready);
        });

        this.bot.client.on(DiscordEvent.Message, this.bot.handle.message);
        this.bot.client.on(DiscordEvent.Error, (error: Error) => Log.error(error.message));

        // If enabled, handle message edits (if valid) as commands.
        if (this.bot.options.updateOnMessageEdit) {
            this.bot.client.on(DiscordEvent.MessageUpdated, async (oldMessage: Message, newMessage: Message) => {
                await this.bot.handle.message(newMessage, true);
            });
        }

        Log.success("Discord events setup completed");
    }
}
