import CommandParser from "../commands/command-parser";
import CommandContext, {CommandExecutionContextOptions} from "../commands/command-context";
import ConsoleInterface from "../console/console-interface";
import EmojiMenuManager from "../emoji-ui/emoji-menu-manager";
import CommandStore from "../commands/command-store";
import Utils from "./utils";
import EmojiCollection from "../collections/emoji-collection";
import Settings from "./settings";
import CommandLoader from "../commands/command-loader";
import Log from "./log";
import DataProvider from "../data-providers/data-provider";
import CommandAuthStore from "../commands/auth-stores/command-auth-store";
import Temp from "./temp";
import {Client, GuildMember, Message, Role, Snowflake} from "discord.js";
import JsonAuthStore from "../commands/auth-stores/json-auth-store";
import BehaviourManager from "../behaviours/behaviour-manager";
import {CommandArgumentStyle, UserGroup} from "../commands/command";
import JsonProvider from "../data-providers/json-provider";
import CommandHandler from "../commands/command-handler";

const Discord = require("discord.js");
const EventEmitter = require("events");
const fs = require("fs");
const {performance} = require("perf_hooks");

export interface BotOptions {
    readonly settings: Settings;
    readonly authStore: CommandAuthStore;
    readonly dataStore?: DataProvider;
    readonly argumentTypes?: any;
    readonly prefixCommand?: boolean;
    readonly primitiveCommands?: Array<string>;
    readonly commandArgumentStyle?: CommandArgumentStyle;
    readonly autoDeleteCommands?: boolean;
    readonly userGroups?: Array<UserGroup>;
    readonly checkCommands?: boolean;
    readonly owner?: Snowflake;
    readonly ignoreBots?: boolean;
}

/**
 * @extends EventEmitter
 */
export default class Bot extends EventEmitter {
    readonly settings: Settings;
    readonly temp: Temp;
    readonly dataStore?: DataProvider;
    readonly authStore: CommandAuthStore;
    readonly emojis?: EmojiCollection;
    readonly client: Client; // TODO
    readonly behaviours: BehaviourManager;
    readonly commandStore: CommandStore;
    readonly commandHandler: CommandHandler;
    readonly commandLoader: CommandLoader;
    readonly console: ConsoleInterface;
    readonly menus: EmojiMenuManager;
    readonly prefixCommand: boolean;
    readonly primitiveCommands: Array<string>;
    readonly commandArgumentStyle: CommandArgumentStyle;
    readonly autoDeleteCommands: boolean;
    readonly userGroups: Array<UserGroup>;
    readonly checkCommands: boolean;
    readonly owner?: Snowflake;
    readonly ignoreBots: boolean;

    private api?: any;
    private setupStart: number = 0;

    /**
     * Setup the bot from an object
     * @param {BotOptions} options
     * @return {Promise<Bot>}
     */
    constructor(options: BotOptions) {
        super();

        /**
         * @type {Settings}
         * @readonly
         */
        this.settings = options.settings;

        /**
         * @todo Temporary hard-coded user id
         * @type {Temp}
         * @readonly
         */
        this.temp = new Temp();

        /**
         * @type {DataProvider | undefined}
         * @readonly
         */
        this.dataStore = options.dataStore;

        /**
         * @type {CommandAuthStore}
         * @readonly
         */
        this.authStore =  options.authStore || new JsonAuthStore("auth/schema.json", "auth/store.json");

        /**
         * @type {EmojiCollection | undefined}
         * @readonly
         */
        this.emojis = fs.existsSync(this.settings.paths.emojis) ? EmojiCollection.fromFile(this.settings.paths.emojis) : undefined;

        /**
         * @type {Discord.Client}
         * @readonly
         */
        this.client = new Discord.Client();

        /**
         * @type {BehaviourManager}
         * @readonly
         */
        this.behaviours = new BehaviourManager(this, this.settings.paths.behaviours);

        /**
         * @type {CommandStore}
         * @readonly
         */
        this.commandStore = new CommandStore(this, this.settings.paths.commands, this.authStore);

        /**
         * @type {CommandHandler}
         * @readonly
         */
        this.commandHandler = new CommandHandler({
            commandStore: this.commandStore,
            errorHandlers: [], // TODO: Is this like it was? Is it ok?
            authStore: this.authStore,
            argumentTypes: options.argumentTypes || {}
        });

        /**
         * @type {CommandLoader}
         * @readonly
         */
        this.commandLoader = new CommandLoader(this.commandStore);

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
        this.prefixCommand = options.prefixCommand || true;

        /**
         * @type {Array<string>}
         * @readonly
         */
        this.primitiveCommands = options.primitiveCommands || [
            "help",
            "usage",
            "ping",
            "auth",
            "setauth",
            "prefix"
        ];

        /**
         * @type {CommandArgumentStyle}
         * @readonly
         */
        this.commandArgumentStyle = options.commandArgumentStyle || CommandArgumentStyle.Specific;

        /**
         * @type {boolean}
         * @readonly
         */
        this.autoDeleteCommands = options.autoDeleteCommands || false;

        // TODO: Make use of the userGroups property
        /**
         * @type {Array<UserGroup>}
         * @readonly
         */
        this.userGroups = options.userGroups || [];

        /**
         * @type {boolean}
         * @readonly
         */
        this.checkCommands = options.checkCommands !== undefined ? options.checkCommands : true;

        /**
         * @type {Snowflake | undefined}
         * @readonly
         */
        this.owner = options.owner;

        /**
         * @type {boolean}
         * @readonly
         */
        this.ignoreBots = options.ignoreBots !== undefined ? options.ignoreBots : true;

        return this;
    }

    /**
     * @returns {*}
     */
    getAPI(): any {
        return this.api;
    }

    /**
     * Setup the bot
     * @return {Promise<Bot>}
     */
    async setup(api?: any): Promise<Bot> {
        this.api = api;
        this.setupStart = performance.now();

        // Load behaviours
        const behavioursLoaded: number = this.behaviours.loadAllSync();

        Log.verbose(`[Bot.setup] Loaded ${behavioursLoaded} behaviours`);

        const behavioursEnabled: number = this.behaviours.enableAll();

        Log.success(`[Bot.setup] Enabled ${behavioursEnabled} behaviours`);

        // Load commandStore
        await this.commandLoader.reloadAll();

        // TODO: Primitives should be loaded first
        // Load primitive commandStore
        await this.commandLoader.loadPrimitives(this.primitiveCommands);

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

        // Discord client events
        this.client.on("ready", async () => {
            // Setup temp
            this.temp.setup(this.client.user.id);

            // Create the temp folder
            await this.temp.create();

            if (!this.console.ready) {
                // Setup the console command interface
                this.console.setup(this);
            }

            // Setup the command auth store
            await this.setupAuthStore();
            Log.info(`[Bot.setupEvents] Logged in as ${this.client.user.tag}`);

            let suffix = "s";
            let took = (performance.now() - this.setupStart) / 1000;
            let rounded = Math.round(took);

            if (rounded <= 0) {
                rounded = Math.round(took * 1000);
                suffix = "ms";
            }

            Log.success(`[Bot.setupEvents] Ready | Took ${rounded}${suffix}`);
        });

        this.client.on("message", this.handleMessage.bind(this));
        Log.success("[Bot.setupEvents] Discord events setup completed");
    }

    private async handleMessage(message: Message): Promise<void> {
        // TODO: Should be a property/option on Bot, not hardcoded
        // TODO: Find better position
        // TODO: Merge this resolvers with the (if provided) provided
        // ones by the user.
        const resolvers: any = {
            user: (arg: string) => Utils.resolveId(arg),
            channel: (arg: string) => Utils.resolveId(arg),
            role: (arg: string) => Utils.resolveId(arg),
            state: (arg: string) => Utils.translateState(arg),

            member: (arg: string, message: Message): GuildMember | null => {
                const resolvedMember: GuildMember = message.guild.member(Utils.resolveId(arg));

                if (resolvedMember) {
                    return resolvedMember;
                }

                return null;
            }
        };

        // TODO: Cannot do .startsWith with a prefix array
        if ((!message.author.bot || (message.author.bot && !this.ignoreBots)) /*&& message.content.startsWith(this.settings.general.prefix)*/ && CommandParser.isValid(message.content, this.commandStore, this.settings.general.prefixes)) {
            const command = CommandParser.parse(
                message.content,
                this.commandStore,
                this.settings.general.prefixes
            );

            if (command) {
                this.commandHandler.handle(
                    new CommandContext({
                        message: message,
                        args: CommandParser.resolveArguments(CommandParser.getArguments(message.content), this.commandHandler.argumentTypes, resolvers, message),
                        bot: this,

                        // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review)
                        // TODO: CRITICAL: Default access level set to 0
                        auth: message.guild ? this.authStore.getAuthority(message.guild.id, message.author.id, message.member.roles.map((role: Role) => role.name)) : 0,
                        emojis: this.emojis,
                        label: CommandParser.getCommandBase(message.content, this.settings.general.prefixes)
                    }),

                    command
                );
            }
            else {
                Log.error("[Bot.setupEvents] Failed parsing command");
            }
        }
        else if (message.content === "?prefix" && this.prefixCommand) {
            message.channel.send(`Command prefix(es): **${this.settings.general.prefixes.join(", ")}** | Powered by Anvil v**${await Utils.getAnvilVersion()}**`);
        }
    }

    /**
     * Setup the bot's auth store
     */
    async setupAuthStore(): Promise<void> {
        // Initially load data if it is a JsonAuthStore
        if (this.authStore instanceof JsonAuthStore) {
            await this.authStore.reload();
        }

        const guilds = this.client.guilds.array();

        let entries = 0;

        for (let i = 0; i < guilds.length; i++) {
            if (!this.authStore.contains(guilds[i].id)) {
                this.authStore.create(guilds[i].id);
                entries++;
            }
        }

        // Save the auth store if it is a JsonAuthStore
        if (this.authStore instanceof JsonAuthStore) {
            await this.authStore.save();
        }

        if (entries > 0) {
            Log.info(`[Bot.setupAuthStore] Added a total of ${entries} new auth store entries`);
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
     * @todo Use the reload modules param
     * Restart the client
     * @param {boolean} reloadModules Whether to reload all modules
     * @return {Promise<Bot>}
     */
    async restart(reloadModules: boolean = true): Promise<Bot> {
        Log.verbose("[Bot.restart] Restarting");

        if (reloadModules) {
            // TODO: Actually reload all the features and commandStore
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
        // Save auth store if it's a JsonAuthStore
        if (this.authStore instanceof JsonAuthStore) {
            Log.verbose("[Bot.disconnect] Saving auth store");
            await this.authStore.save();
        }

        // Save data before exiting
        if (this.dataStore && this.dataStore instanceof JsonProvider) {
            Log.verbose("[Bot.disconnect] Saving JsonProvider");
            await this.dataStore.save();
        }

        // Reset the temp folder before shutdown
        await this.temp.reset();

        // TODO
        //this.settings.save();
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
