import CommandParser from "../commands/command-parser";
import CommandContext from "../commands/command-context";
import ConsoleInterface from "../console/console-interface";
import EmojiMenuManager from "../emoji-ui/emoji-menu-manager";
import CommandStore from "../commands/command-store";
import Utils from "./utils";
import EmojiCollection from "../collections/emoji-collection";
import Settings from "./settings";
import Log from "./log";
import DataProvider from "../data-providers/data-provider";
import CommandAuthStore from "../commands/auth-stores/command-auth-store";
import Temp from "./temp";
import {Client, GuildMember, Message, RichEmbed, Role, Snowflake} from "discord.js";
import JsonAuthStore from "../commands/auth-stores/json-auth-store";
import BehaviourManager from "../behaviours/behaviour-manager";
import Command, {CommandArgumentStyle, UserGroup} from "../commands/command";
import JsonProvider from "../data-providers/json-provider";
import CommandHandler from "../commands/command-handler";
import Discord from "discord.js";
import EventEmitter from "events";
import fs from "fs";
import {performance} from "perf_hooks";
import path from "path";
import FragmentLoader from "../fragments/fragment-loader";
import Fragment from "../fragments/fragment";
import Language from "../language/language";

const internalFragmentsPath: string = path.resolve(path.join(__dirname, "../fragments/internal"));

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
    readonly updateOnMessageEdit?: boolean;
    readonly allowCommandChain?: boolean;

    // TODO: Make use of authGroups
    readonly authGroups?: any;
    readonly asciiTitle?: boolean;
    readonly consoleInterface?: boolean;
}

/**
 * @extends EventEmitter
 */
export default class Bot<ApiType = any> extends EventEmitter {
    public readonly settings: Settings;
    public readonly temp: Temp;
    public readonly dataStore?: DataProvider;
    public readonly authStore: CommandAuthStore;
    public readonly emojis?: EmojiCollection;
    public readonly client: Client; // TODO
    public readonly behaviours: BehaviourManager;
    public readonly commandStore: CommandStore;
    public readonly commandHandler: CommandHandler;
    public readonly console: ConsoleInterface;
    public readonly menus: EmojiMenuManager;
    public readonly prefixCommand: boolean;
    public readonly primitiveCommands: Array<string>;
    public readonly commandArgumentStyle: CommandArgumentStyle;
    public readonly autoDeleteCommands: boolean;
    public readonly userGroups: Array<UserGroup>;
    public readonly checkCommands: boolean;
    public readonly owner?: Snowflake;
    public readonly ignoreBots: boolean;
    public readonly updateOnMessageEdit: boolean;
    public readonly allowCommandChain: boolean;
    public readonly authGroups: any;
    public readonly asciiTitle: boolean;
    public readonly consoleInterface: boolean;
    public readonly language?: Language;

    private api?: ApiType;
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
        this.authStore = options.authStore || new JsonAuthStore("auth/schema.json", "auth/store.json");

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
        this.behaviours = new BehaviourManager(this);

        /**
         * @type {CommandStore}
         * @readonly
         */
        this.commandStore = new CommandStore(this, this.authStore);

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

        /**
         * @type {boolean}
         * @readonly
         */
        this.updateOnMessageEdit = options.updateOnMessageEdit !== undefined ? options.updateOnMessageEdit : false;

        /**
         * @type {*}
         * @readonly
         */
        this.authGroups = options.authGroups || {};

        /**
         * @type {boolean}
         * @readonly
         */
        this.allowCommandChain = options.allowCommandChain !== undefined ? options.allowCommandChain : true;

        /**
         * Whether to display the Anvil logo in ascii text at bot startup
         * @type {boolean}
         * @readonly
         */
        this.asciiTitle = options.asciiTitle !== undefined ? options.asciiTitle : true;

        /**
         * Whether to enable the console interface
         * @type {boolean}
         * @readonly
         */
        this.consoleInterface = options.consoleInterface !== undefined ? options.consoleInterface : true;

        /**
         * Localization
         * @type {Language | undefined}
         * @readonly
         */
        this.language = this.settings.paths.languages ? new Language(this.settings.paths.languages) : undefined;

        return this;
    }

    /**
     * @return {*}
     */
    public getAPI(): ApiType | undefined {
        return this.api;
    }

    /**
     * Setup the bot
     * @return {Promise<this>}
     */
    public async setup(api?: ApiType): Promise<this> {
        if (this.asciiTitle) {
            console.log("\n" + fs.readFileSync(path.resolve(path.join(__dirname, "../../dist/title.txt"))).toString() + "\n");
        }

        /**
         * @type {*}
         * @private
         * @readonly
         */
        this.api = api;

        /**
         * @type {number}
         * @private
         */
        this.setupStart = performance.now();

        Log.verbose("[Bot.setup] Attempting to load internal fragments");

        // Load & enable internal fragments
        const internalFragmentCandidates: Array<string> | null = await FragmentLoader.pickupCandidates(internalFragmentsPath);

        if (!internalFragmentCandidates) {
            throw new Error("[Bot.setup] Failed to load internal fragments");
        }

        if (internalFragmentCandidates.length > 0) {
            Log.verbose(`[Bot.setup] Loading ${internalFragmentCandidates.length} internal fragments`);
        }
        else {
            Log.warn("[Bot.setup] No internal fragments were detected");
        }

        const internalFragments: Array<Fragment> | null = await FragmentLoader.loadMultiple(internalFragmentCandidates);

        if (!internalFragments || internalFragments.length === 0) {
            Log.warn("[Bot.setup] No internal fragments were loaded");
        }
        else {
            const enabled: number = this.enableFragments(internalFragments);

            if (enabled === 0) {
                Log.warn("[Bot.setup] No internal fragments were enabled");
            }
            else {
                Log.success(`[Bot.setup] Enabled ${enabled}/${internalFragments.length} internal fragments`);
            }
        }

        // Load & enable consumer command fragments
        const consumerCommandCandidates: Array<string> | null = await FragmentLoader.pickupCandidates(this.settings.paths.commands);

        if (!consumerCommandCandidates || consumerCommandCandidates.length === 0) {
            Log.warn(`[Bot.setup] No commands were detected under '${this.settings.paths.commands}'`);
        }
        else {
            Log.verbose(`[Bot.setup] Loading ${consumerCommandCandidates.length} command(s)`);

            const commandsLoaded: Array<Fragment> | null = await FragmentLoader.loadMultiple(consumerCommandCandidates);

            if (!commandsLoaded || commandsLoaded.length === 0) {
                Log.warn(`[Bot.setup] No commands were loaded`);
            }
            else {
                Log.success(`[Bot.setup] Loaded ${commandsLoaded.length} command(s)`);
                this.enableFragments(commandsLoaded);
            }
        }

        // Setup the Discord client's events
        this.setupEvents();

        Log.success("[Bot.setup] Bot setup completed");

        return this;
    }

    private enableFragments(fragments: Array<Fragment>): number {
        let enabled: number = 0;

        for (let i: number = 0; i < fragments.length; i++) {
            if ((fragments[i] as any).prototype instanceof Command) {
                const fragment: any = fragments[i];
                
                this.commandStore.register(new fragment());
                enabled++;
            }
            else {
                Log.warn(`[Bot.enableFragments] Unknown fragment instance for fragment: ${fragments[i].meta.name}, ignoring`);
            }
        }

        return enabled;
    }

    /**
     * Setup the client's events
     */
    private setupEvents(): void {
        Log.verbose("[Bot.setupEvents] Setting up Discord events");

        // Discord client events
        this.client.on("ready", async () => {
            // Setup temp
            this.temp.setup(this.client.user.id);

            // Create the temp folder
            await this.temp.create();

            if (this.consoleInterface && !this.console.ready) {
                // Setup the console command interface
                this.console.setup(this);
            }

            // Setup the command auth store
            await this.setupAuthStore();
            Log.info(`[Bot.setupEvents] Logged in as ${this.client.user.tag} | ${this.client.guilds.size} guild(s)`);

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

        // If enabled, handle message edits (if valid) as commands
        if (this.updateOnMessageEdit) {
            this.client.on("messageUpdate", async (oldMessage: Message, newMessage: Message) => {
                await this.handleMessage(newMessage);
            });
        }

        Log.success("[Bot.setupEvents] Discord events setup completed");
    }

    /**
     * @param {Message} message
     * @return {Promise<void>}
     */
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
            if (this.allowCommandChain) {
                const chain: Array<string> = message.content.split("&");

                // TODO: What if commandChecks is enabled and the bot tries to react twice or more?
                for (let i: number = 0; i < chain.length; i++) {
                    await this.handleCommandMessage(message, chain[i].trim(), resolvers);
                }
            }
            else {
                await this.handleCommandMessage(message, message.content, resolvers);
            }
        }
        // TODO: ?prefix should also be chain-able
        else if (message.content === "?prefix" && this.prefixCommand) {
            message.channel.send(new RichEmbed()
                .setDescription(`Command prefix(es): **${this.settings.general.prefixes.join(", ")}** | Powered by [Anvil v**${await Utils.getAnvilVersion()}**](http://test.com/)`)
                .setColor("GREEN"));
        }
    }

    private async handleCommandMessage(message: Message, content: string, resolvers: any) {
        const command = CommandParser.parse(
            content,
            this.commandStore,
            this.settings.general.prefixes
        );

        if (command) {
            await this.commandHandler.handle(
                new CommandContext({
                    message: message,
                    args: CommandParser.resolveArguments(CommandParser.getArguments(content), this.commandHandler.argumentTypes, resolvers, message),
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
            Log.error("[Bot.handleCommandMessage] Failed parsing command");
        }
    }

    /**
     * Setup the bot's auth store
     */
    public async setupAuthStore(): Promise<void> {
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
    public async connect(): Promise<Bot> {
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
    public async restart(reloadModules: boolean = true): Promise<Bot> {
        Log.verbose("[Bot.restart] Restarting");

        if (reloadModules) {
            // TODO: Actually reload all the features and commandStore
            // this.features.reloadAll(this);
            // TODO: New fragments system
            // await this.commandLoader.reloadAll();
        }

        await this.disconnect();
        await this.connect();

        return this;
    }

    /**
     * Disconnect the client
     * @return {Promise<Bot>}
     */
    public async disconnect(): Promise<Bot> {
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
    public static async clearTemp(): Promise<any> {
        if (fs.existsSync("./temp")) {
            fs.readdir("./temp", (error: any, files: any) => {
                for (let i = 0; i < files.length; i++) {
                    fs.unlink(`./temp/${files[i]}`, (error: Error) => {
                        throw error;
                    });
                }
            });
        }
    }
}
