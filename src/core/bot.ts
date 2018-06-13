import CommandParser from "../commands/command-parser";
import CommandExecutionContext, {CommandExecutionContextOptions} from "../commands/command-execution-context";
import ConsoleInterface from "../console/console-interface";
import EmojiMenuManager from "../emoji-ui/emoji-menu-manager";
import CommandManager from "../commands/command-manager";
import Utils from "./utils";
import EmojiCollection from "../collections/emoji-collection";
import Settings from "./settings";
import FeatureManager from "../features/feature-manager";
import CommandLoader from "../commands/command-loader";
import Log from "./log";
import DataStore from "../data-stores/data-store";
import CommandAuthStore from "../commands/command-auth-store";

const Discord = require("discord.js");
const EventEmitter = require("events");
const fs = require("fs");

export interface BotPathOptions {
    readonly settings: string;
    readonly commands: string;
    readonly emojis: string;
}

export interface BotOptions {
    readonly paths: BotPathOptions;
    readonly authStore: CommandAuthStore;
    readonly dataStore?: DataStore;
    readonly argumentTypes?: any;
    readonly prefixCommand?: boolean;
}

/**
 * @extends EventEmitter
 */
export default class Bot extends EventEmitter {
    readonly settings: Settings;
    readonly dataStore?: DataStore;
    readonly authStore: CommandAuthStore;
    readonly emojis?: EmojiCollection;
    readonly client: any; // TODO
    readonly commands: CommandManager;
    readonly features: FeatureManager;
    readonly commandLoader: CommandLoader;
    readonly console: ConsoleInterface;
    readonly menus: EmojiMenuManager;
    readonly prefixCommand: boolean;

    /**
     * Setup the bot from an object
     * @param {Object} options
     * @return {Promise<Bot>}
     */
    constructor(options: BotOptions) {
        super();

        /**
         * @type {Settings}
         * @readonly
         */
        this.settings = new Settings(options.paths.settings);

        /**
         * @type {DataStore}
         * @readonly
         */
        this.dataStore = options.dataStore ? options.dataStore : undefined;

        /**
         * @type {CommandAuthStore}
         * @readonly
         */
        this.authStore = options.authStore;

        /**
         * @type {EmojiCollection|null}
         * @readonly
         */
        this.emojis = options.paths.emojis ? EmojiCollection.fromFile(options.paths.emojis) : undefined;

        /**
         * @type {Discord.Client}
         * @readonly
         */
        this.client = new Discord.Client();

        /**
         * @type {CommandManager}
         * @readonly
         */
        this.commands = new CommandManager(this, options.paths.commands, this.authStore, options.argumentTypes ? options.argumentTypes : {});

        /**
         * @type {FeatureManager}
         * @readonly
         */
        this.features = new FeatureManager(this);

        /**
         * @type {CommandLoader}
         * @readonly
         */
        this.commandLoader = new CommandLoader(this.commands);

        /**
         * @type {ConsoleInterface}
         * @readonly
         */
        this.console = new ConsoleInterface();

        /**
         * @type {EmojiMenuManager}
         * @readonly
         */
        this.menus = new EmojiMenuManager(this.client);

        /**
         * @type {boolean}
         * @readonly
         */
        this.prefixCommand = options.prefixCommand ? options.prefixCommand : true;

        return this;
    }

    /**
     * Setup the bot
     * @return {Promise<Bot>}
     */
    async setup(): Promise<Bot> {
        // Load settings
        await this.settings.reload();

        // Load commands
        await this.commandLoader.reloadAll();

        // Setup the Discord client's events
        this.setupEvents();

        Log.success("[Bot.setup] Bot setup completed");

        return this;
    }

    /**
     * Setup the client's events
     */
    setupEvents(): void {
        Log.verbose("[Bot.setupEvents] Setting up Discord events");

        // TODO: Find better position
        // TODO: Merge this resolvers with the (if provided) provided
        // ones by the user.
        const resolvers: any = {
            user: (arg: string) => Utils.resolveId(arg),
            channel: (arg: string) => Utils.resolveId(arg),
            role: (arg: string) => Utils.resolveId(arg),
            state: (arg: string) => Utils.translateState(arg)
        };

        // Discord client events
        this.client.on("ready", () => {
            if (!this.console.ready) {
                // Setup the console command interface
                this.console.setup(this);
            }

            // Setup the command auth store
            this.setupAuthStore();
            Log.info(`[Bot.setupEvents] Logged in as ${this.client.user.tag}`);
            Log.success("[Bot.setupEvents] Ready");
        });

        this.client.on("message", async (message: any) => {
            if (!message.author.bot && CommandParser.isValid(message.content, this.commands, this.settings.general.prefix)) {
                const executionOptions: CommandExecutionContextOptions = {
                    message: message,
                    args: CommandParser.resolveArguments(CommandParser.getArguments(message.content), this.commands.argumentTypes, resolvers),
                    bot: this,

                    // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review)
                    // TODO: CRITICAL: Default access level set to 0
                    auth: message.guild ? this.authStore.getAuthority(message.guild.id, message.member.roles.array().map((role: any) => role.name), message.author.id) : 0,
                    emojis: this.emojis,
                    label: CommandParser.getCommandBase(message.content, this.settings.general.prefix)
                };
                
                const command = CommandParser.parse(
                    message.content,
                    this.commands,
                    this.settings.general.prefix
                );

                if (command) {
                    this.commands.handle(
                        new CommandExecutionContext(executionOptions),
                        command
                    );
                }
                else {
                    Log.error("[Bot.setupEvents] Failed parsing command");
                }
            }
            else if (message.content === "?prefix" && this.prefixCommand) {
                message.channel.send(`Command prefix: **${this.settings.general.prefix}** | Powered by Anvil v**${await Utils.getAnvilVersion()}**`);
            }
        });

        Log.success("[Bot.setupEvents] Discord events setup completed");
    }

    setupAuthStore(): void {
        const guilds = this.client.guilds.array();

        let entries = 0;

        for (let i = 0; i < guilds.length; i++) {
            if (!this.authStore.contains(guilds[i].id)) {
                this.authStore.create(guilds[i].id);
                entries++;
            }
        }

        if (entries > 0) {
            Log.success(`[Bot.setupAuthStore] Added a total of ${entries} new auth store entries`);
        }

        Log.success("[Bot.setupAuthStore] Auth store setup completed");
    }

    /**
     * Connect the client
     * @return {Promise<Bot>}
     */
    async connect(): Promise<Bot> {
        Log.verbose("[Bot.connect] Starting");
        await this.client.login(this.settings.general.token);

        return this;
    }

    /**
     * Restart the bot's client
     * @todo Use the reload modules param
     * @param {boolean} reloadModules Whether to reload all modules
     * @return {Promise<Bot>}
     */
    async restart(reloadModules: boolean = true): Promise<Bot> {
        Log.verbose("[Bot.restart] Restarting");

        if (reloadModules) {
            // TODO: Actually reload all the features and commands
            // this.features.reloadAll(this);
            await this.commandLoader.reloadAll();
        }

        await this.disconnect();
        await this.connect();

        return this;
    }

    /**
     * Disconnect the client
     * @return {Promise<Bot>}
     */
    async disconnect(): Promise<Bot> {
        this.settings.save();
        await this.client.destroy();
        Log.info("[Bot.disconnect] Disconnected");

        return this;
    }

    /**
     * Clear all the files inside the temp folder
     * @return {Promise<*>}
     */
    static async clearTemp(): Promise<any> {
        if (fs.existsSync("./temp")) {
            fs.readdir("./temp", (error: any, files: any) => {
                for (let i = 0; i < files.length; i++) {
                    fs.unlink(`./temp/${files[i]}`);
                }
            });
        }
    }
}
