import Log from "./log";
import DiscordEvent from "./discordEvent";
import Bot from "./bot";
import {BotState, BotEvent} from "./botExtra";
import {Message} from "discord.js";
import {Title, DebugMode, InternalFragmentsPath} from "./constants";
import BotMessages from "./messages";
import Loader, {IPackage} from "../fragments/loader";
import {PromiseOr} from "@atlas/xlib";
import Util from "./util";
import {performance} from "perf_hooks";

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
            console.log("\n%s\n", Title.replace("{version}", "beta"));
        }

        if (DebugMode) {
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

        Log.verbose("Attempting to load internal fragments");
        this.bot.emit(BotEvent.LoadingInternalFragments);

        // Load & enable internal fragments.
        const internalFragmentCandidates: string[] | null = await Loader.scan(InternalFragmentsPath);

        // The scan process failed for some reason.
        if (!internalFragmentCandidates) {
            throw Log.error(BotMessages.SETUP_FAIL_LOAD_FRAGMENTS);
        }

        if (internalFragmentCandidates.length > 0) {
            Log.verbose(`Loading ${internalFragmentCandidates.length} internal fragments`);
        }
        else {
            Log.warn(BotMessages.SETUP_NO_FRAGMENTS_DETECTED);
        }

        const internalFragments: IPackage[] | null = await Loader.loadMultiple(internalFragmentCandidates);

        if (!internalFragments || internalFragments.length === 0) {
            Log.warn(BotMessages.SETUP_NO_FRAGMENTS_LOADED);
        }
        else {
            const enabled: number = await this.bot.fragments.enableMultiple(internalFragments, true);

            if (enabled === 0) {
                Log.warn(BotMessages.SETUP_NO_FRAGMENTS_ENABLED);
            }
            else {
                Log.success(`Enabled ${enabled}/${internalFragments.length} (${Util.percentOf(enabled, internalFragments.length)}%) internal fragments`);
            }
        }

        this.bot.emit(BotEvent.LoadedInternalFragments, internalFragments || []);
        this.bot.emit(BotEvent.LoadingServices);

        // Load & enable services.
        const consumerServiceCandidates: string[] | null = await Loader.scan(this.bot.options.paths.services);

        if (!consumerServiceCandidates || consumerServiceCandidates.length === 0) {
            Log.verbose(`No services were detected under '${this.bot.options.paths.services}'`);
        }
        else {
            Log.verbose(`Loading ${consumerServiceCandidates.length} service(s)`);

            const servicesLoaded: IPackage[] | null = await Loader.loadMultiple(consumerServiceCandidates);

            if (!servicesLoaded || servicesLoaded.length === 0) {
                Log.warn(BotMessages.SETUP_NO_SERVICES_LOADED);
            }
            else {
                Log.success(`Loaded ${servicesLoaded.length} service(s)`);
                await this.bot.fragments.enableMultiple(servicesLoaded);
            }
        }

        // After loading services, enable all of them.
        // TODO: Returns amount of enabled services.
        await this.bot.services.startAll();

        this.bot.emit(BotEvent.LoadedServices);
        this.bot.emit(BotEvent.LoadingCommands);

        // Load & enable consumer command fragments.
        const consumerCommandCandidates: string[] | null = await Loader.scan(this.bot.options.paths.commands);

        if (!consumerCommandCandidates || consumerCommandCandidates.length === 0) {
            Log.warn(`No commands were detected under '${this.bot.options.paths.commands}'`);
        }
        else {
            Log.verbose(`Loading ${consumerCommandCandidates.length} command(s)`);

            const commandsLoaded: IPackage[] | null = await Loader.loadMultiple(consumerCommandCandidates);

            if (!commandsLoaded || commandsLoaded.length === 0) {
                Log.warn(BotMessages.SETUP_NO_COMMANDS_LOADED);
            }
            else {
                const enabled: number = await this.bot.fragments.enableMultiple(commandsLoaded);

                if (enabled > 0) {
                    Log.success(`Enabled ${commandsLoaded.length}/${consumerCommandCandidates.length} (${Util.percentOf(commandsLoaded.length, consumerCommandCandidates.length)}%) command(s)`);
                }
                else {
                    Log.warn(BotMessages.SETUP_NO_COMMANDS_ENABLED);
                }
            }
        }

        // Begin loading & enabling tasks. First, unregister all existing ones.
        await this.bot.tasks.unregisterAll();
        Log.verbose(BotMessages.SETUP_LOADING_TASKS);

        const loaded: number = await this.bot.tasks.loadAll(this.bot.options.paths.tasks);

        if (loaded > 0) {
            Log.success(`Loaded ${loaded} task(s)`);

            const enabled: number = this.bot.tasks.enableAll();

            if (enabled > 0) {
                Log.success(`Triggered ${enabled}/${loaded} task(s)`);
            }
            else if (enabled === 0 && loaded > 0) {
                Log.warn(BotMessages.SETUP_NO_TASKS_TRIGGERED);
            }
        }
        else {
            Log.verbose(BotMessages.SETUP_NO_TASKS_FOUND);
        }

        this.bot.emit(BotEvent.LoadedCommands);

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
