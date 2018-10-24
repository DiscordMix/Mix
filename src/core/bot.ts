import CommandParser from "../commands/command-parser";
import CommandContext from "../commands/command-context";
import ConsoleInterface from "../console/console-interface";
import CommandStore from "../commands/command-store";
import Utils from "./utils";
import EmojiCollection from "../collections/emoji-collection";
import Settings from "./settings";
import Log from "./log";
import DataProvider from "../data-providers/data-provider";
import Temp from "./temp";
import Discord, {Client, Guild, GuildMember, Message, RichEmbed, Role, Snowflake, TextChannel} from "discord.js";
import ServiceManager from "../services/service-manager";

import Command, {
    IArgumentResolver,
    ArgumentStyle,
    DefaultCommandRestrict,
    ICustomArgType,
    InternalArgType,
    IRawArguments,
    IUserGroup
} from "../commands/command";

import JsonProvider from "../data-providers/json-provider";
import CommandHandler from "../commands/command-handler";
import EventEmitter from "events";
import fs from "fs";
import {performance} from "perf_hooks";
import path from "path";
import FragmentLoader from "../fragments/fragment-loader";
import {IFragment} from "../fragments/fragment";
import Language from "../language/language";
import Service from "../services/service";

import {
    BotEvents,
    ChannelMessageEvents,
    IDecoratorCommand,
    DecoratorCommands,
    DecoratorCommandType,
    SimpleCommand
} from "../decorators/decorators";

import StatCounter from "./stat-counter";
import Patterns from "./patterns";
import {IDisposable} from "./snap";

if (process.env.FORGE_DEBUG_MODE === "true") {
    Log.info("[Forge] Debug mode is enabled");
}

const title: string =

    "███████╗ ██████╗ ██████╗  ██████╗ ███████╗\n" +
    "██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝\n" +
    "█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  \n" +
    "██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  \n" +
    "██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗\n" +
    "╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ {version}";

const internalFragmentsPath: string = path.resolve(path.join(__dirname, "../fragments/internal"));

// TODO: Should be a property/option on Bot, not hardcoded
// TODO: Merge this resolvers with the (if provided) provided
// ones by the user.
const internalArgResolvers: IArgumentResolver[] = [
    {
        name: InternalArgType.Member,

        resolve(arg: string, message: Message): GuildMember | null {
            const resolvedMember: GuildMember = message.guild.member(Utils.resolveId(arg));

            if (resolvedMember) {
                return resolvedMember;
            }

            return null;
        }
    },
    {
        name: InternalArgType.Role,

        resolve(arg: string, message: Message): Role | null {
            const resolvedRole: Role | undefined = message.guild.roles.get(Utils.resolveId(arg));

            if (resolvedRole) {
                return resolvedRole;
            }

            return null;
        }
    },
    {
        name: InternalArgType.State,

        resolve(arg: string): boolean {
            return Utils.translateState(arg);
        }
    },
    {
        name: InternalArgType.Snowflake,

        resolve(arg: string): Snowflake {
            return Utils.resolveId(arg);
        }
    }
];

// TODO: Message type and resolver
const internalArgTypes: ICustomArgType[] = [
    {
        name: InternalArgType.Channel,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.channels.has(Utils.resolveId(arg));
        }
    },
    {
        name: InternalArgType.Member,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.member(Utils.resolveId(arg)) !== undefined;
        }
    },
    {
        name: InternalArgType.Role,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.roles.has(Utils.resolveId(arg));
        }
    },
    {
        name: InternalArgType.Snowflake,
        check: Patterns.mentionOrSnowflake
    },
    {
        name: InternalArgType.State,
        check: Patterns.state
    }
];

export type IBotOptions = {
    readonly settings: Settings;
    readonly dataStore?: DataProvider;
    readonly prefixCommand?: boolean;
    readonly primitiveCommands?: string[];
    readonly userGroups?: IUserGroup[];
    readonly owner?: Snowflake;
    readonly options?: Partial<IBotExtraOptions>;
    readonly argumentResolvers?: IArgumentResolver[];
    readonly argumentTypes?: ICustomArgType[];
}

export const DefaultBotEmojiOptions: IDefiniteBotEmojiOptions = {
    success: ":white_check_mark:",
    error: ":thinking:"
};

export type IBotEmojiOptions = {
    readonly success?: string;
    readonly error?: string;
}

export type IDefiniteBotEmojiOptions = {
    readonly success: string;
    readonly error: string;
}

export type IBotExtraOptions = {
    readonly asciiTitle: boolean;
    readonly consoleInterface: boolean;
    readonly allowCommandChain: boolean;
    readonly updateOnMessageEdit: boolean;
    readonly checkCommands: boolean;
    readonly autoDeleteCommands: boolean;
    readonly commandArgumentStyle: ArgumentStyle;
    readonly ignoreBots: boolean;
    readonly autoResetAuthStore: boolean;
    readonly logMessages: boolean;
    readonly dmHelp: boolean;
    readonly emojis: IDefiniteBotEmojiOptions;
}

const DefaultBotOptions: IBotExtraOptions = {
    allowCommandChain: true,
    commandArgumentStyle: ArgumentStyle.Explicit,
    autoDeleteCommands: false,
    checkCommands: true,
    ignoreBots: true,
    updateOnMessageEdit: false,
    asciiTitle: true,
    autoResetAuthStore: false,
    dmHelp: true,
    logMessages: false,
    emojis: DefaultBotEmojiOptions,
    consoleInterface: true
};

export enum EBotEvents {
    SetupStart = "setupStart",
    LoadingInternalFragments = "loadInternalFragments",
    LoadedInternalFragments = "loadedInternalFragments",
    LoadingServices = "loadServices",
    LoadedServices = "loadedServices",
    Ready = "ready",
    HandleMessageStart = "handleMessageStart",
    HandleMessageEnd = "handleMessageEnd",
    HandleCommandMessageStart = "handleCommandMessageStart",
    HandleCommandMessageEnd = "handleCommandMessageEnd",
    Restarting = "restartStart",
    Restarted = "restartCompleted",
    Disconnecting = "disconnecting",
    Disconnected = "disconnected",
    ClearingTemp = "clearingTemp",
    ClearedTemp = "clearedTemp",
    HandlingCommand = "handlingCommand",
    CommandError = "commandError",
    CommandExecuted = "commandExecuted"
}

/**
 * Bot events:
 *
 * - setupStart(ApiType?)
 * - loadInternalFragments()
 * - loadedInternalFragments(Fragment[]?)
 * - loadServices()
 * - loadedServices()
 * - loadCommands()
 * - loadedCommands()
 * - ready() --> TODO: Seems like it's missing
 * - handleMessageStart()
 * - handleMessageEnd()
 * - handleCommandMessageStart(Discord.Message, string)
 * - handleCommandMessageEnd(Discord.Message, string)
 * - restartStart(boolean)
 * - restartCompleted(boolean)
 * - disconnecting()
 * - disconnected()
 * - clearingTemp()
 * - clearedTemp()
 *
 * - handlingCommand(CommandContext, Command, Arguments Object)
 * - commandError(Error)
 * - commandExecuted(CommandExecutedEvent, command result (any))
 * -
 */

/**
 * @extends EventEmitter
 */
export default class Bot<ApiType = any> extends EventEmitter implements IDisposable {
    public readonly settings: Settings;
    public readonly temp: Temp;
    public readonly dataStore?: DataProvider;
    public readonly emojis?: EmojiCollection;
    public readonly services: ServiceManager;
    public readonly commandStore: CommandStore;
    public readonly commandHandler: CommandHandler;
    public readonly console: ConsoleInterface;
    public readonly prefixCommand: boolean;
    public readonly primitiveCommands: string[];
    public readonly userGroups: IUserGroup[];
    public readonly owner?: Snowflake;
    public readonly options: IBotExtraOptions;
    public readonly language?: Language;
    public readonly argumentResolvers: IArgumentResolver[];
    public readonly argumentTypes: ICustomArgType[];
    public readonly disposables: IDisposable[];

    public suspended: boolean;

    // TODO: Shouldn't be able to be edited/not read-only
    public client: Client;

    private api?: ApiType;
    private setupStart: number = 0;

    // TODO: Implement stat counter
    private readonly statCounter: StatCounter;

    /**
     * Setup the bot from an object
     * @param {Partial<IBotOptions>} botOptions
     */
    public constructor(botOptions: Partial<IBotOptions>) {
        super();

        if (!botOptions.settings) {
            throw new Error("[Bot] Missing settings options");
        }

        /**
         * @type {Settings}
         * @readonly
         */
        this.settings = botOptions.settings;

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
        this.dataStore = botOptions.dataStore;

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
         * @type {ServiceManager}
         * @readonly
         */
        this.services = new ServiceManager(this);

        /**
         * @type {CommandStore}
         * @readonly
         */
        this.commandStore = new CommandStore(this);

        /**
         * @type {IArgumentResolver[]}
         * @readonly
         */
        this.argumentResolvers = internalArgResolvers;

        if (botOptions.argumentResolvers) {
            this.argumentResolvers = [
                ...this.argumentResolvers,
                ...botOptions.argumentResolvers
            ];
        }

        /**
         * @type {ICustomArgType[]}
         * @readonly
         */
        this.argumentTypes = internalArgTypes;

        if (botOptions.argumentTypes) {
            this.argumentTypes = [
                ...this.argumentTypes,
                ...botOptions.argumentTypes
            ];
        }

        /**
         * @type {CommandHandler}
         * @readonly
         */
        this.commandHandler = new CommandHandler({
            commandStore: this.commandStore,
            errorHandlers: [], // TODO: Is this like it was? Is it ok?
            argumentTypes: this.argumentTypes
        });

        /**
         * @type {ConsoleInterface}
         * @readonly
         */
        this.console = new ConsoleInterface();

        /**
         * @type {boolean}
         * @readonly
         */
        this.prefixCommand = botOptions.prefixCommand || true;

        /**
         * @todo Even if it's not specified here, the throw command was loaded, verify that ONLY specific primitives can be loaded.
         * @type {string[]}
         * @readonly
         */
        this.primitiveCommands = botOptions.primitiveCommands || [
            "help",
            "usage",
            "ping",
            "prefix",
            "cli",
            "throw",
            "eval"
        ];

        /**
         * @type {IBotExtraOptions}
         * @readonly
         */
        this.options = {
            ...DefaultBotOptions,
            ...botOptions.options,
        };

        // TODO: Make use of the userGroups property
        /**
         * @type {IUserGroup[]}
         * @readonly
         */
        this.userGroups = botOptions.userGroups || [];

        /**
         * @type {Snowflake | undefined}
         * @readonly
         */
        this.owner = botOptions.owner;

        /**
         * Localization
         * @type {Language | undefined}
         * @readonly
         */
        this.language = this.settings.paths.languages ? new Language(this.settings.paths.languages) : undefined;

        /**
         * @type {boolean}
         */
        this.suspended = false;

        /**
         * @type {StatCounter}
         */
        this.statCounter = new StatCounter();

        /**
         * @type {IDisposable[]}
         * @private
         * @readonly
         */
        this.disposables = [];

        return this;
    }

    /**
     * @return {ApiType | null}
     */
    public getAPI(): ApiType | null {
        return this.api || null;
    }

    /**
     * Setup the bot
     * @param {ApiType} api
     * @return {Promise<this>}
     */
    private async setup(api?: ApiType): Promise<this> {
        this.emit("setupStart", api);

        if (this.options.asciiTitle) {
            console.log("\n" + title.replace("{version}", "beta") + "\n");
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

        this.emit("loadInternalFragments");

        // Load & enable internal fragments
        const internalFragmentCandidates: string[] | null = await FragmentLoader.pickupCandidates(internalFragmentsPath);

        if (!internalFragmentCandidates) {
            throw new Error("[Bot.setup] Failed to load internal fragments");
        }

        if (internalFragmentCandidates.length > 0) {
            Log.verbose(`[Bot.setup] Loading ${internalFragmentCandidates.length} internal fragments`);
        }
        else {
            Log.warn("[Bot.setup] No internal fragments were detected");
        }

        const internalFragments: IFragment[] | null = await FragmentLoader.loadMultiple(internalFragmentCandidates);

        if (!internalFragments || internalFragments.length === 0) {
            Log.warn("[Bot.setup] No internal fragments were loaded");
        }
        else {
            const enabled: number = await this.enableFragments(internalFragments, true);

            if (enabled === 0) {
                Log.warn("[Bot.setup] No internal fragments were enabled");
            }
            else {
                Log.success(`[Bot.setup] Enabled ${enabled}/${internalFragments.length} internal fragments`);
            }
        }

        this.emit("loadedInternalFragments", internalFragments || []);
        this.emit("loadServices");

        // Load & enable services
        const consumerServiceCandidates: string[] | null = await FragmentLoader.pickupCandidates(this.settings.paths.services);

        if (!consumerServiceCandidates || consumerServiceCandidates.length === 0) {
            Log.verbose(`[Bot.setup] No services were detected under '${this.settings.paths.services}'`);
        }
        else {
            Log.verbose(`[Bot.setup] Loading ${consumerServiceCandidates.length} service(s)`);

            const servicesLoaded: IFragment[] | null = await FragmentLoader.loadMultiple(consumerServiceCandidates);

            if (!servicesLoaded || servicesLoaded.length === 0) {
                Log.warn("[Bot.setup] No services were loaded");
            }
            else {
                Log.success(`[Bot.setup] Loaded ${servicesLoaded.length} service(s)`);
                await this.enableFragments(servicesLoaded);
            }
        }

        // After loading services, enable all of them
        this.services.enableAll();

        this.emit("loadedServices");
        this.emit("loadCommands");

        // Load & enable consumer command fragments
        const consumerCommandCandidates: string[] | null = await FragmentLoader.pickupCandidates(this.settings.paths.commands);

        if (!consumerCommandCandidates || consumerCommandCandidates.length === 0) {
            Log.warn(`[Bot.setup] No commands were detected under '${this.settings.paths.commands}'`);
        }
        else {
            Log.verbose(`[Bot.setup] Loading ${consumerCommandCandidates.length} command(s)`);

            const commandsLoaded: IFragment[] | null = await FragmentLoader.loadMultiple(consumerCommandCandidates);

            if (!commandsLoaded || commandsLoaded.length === 0) {
                Log.warn("[Bot.setup] No commands were loaded");
            }
            else {
                const enabled: number = await this.enableFragments(commandsLoaded);

                if (enabled > 0) {
                    Log.success(`[Bot.setup] Loaded ${commandsLoaded.length}/${consumerCommandCandidates.length} command(s)`);
                }
                else {
                    Log.warn("[Bot.setup] No commands were loaded");
                }
            }
        }

        // Load decorator commands
        this.commandStore.registerMultipleDecorator(DecoratorCommands);

        this.emit("loadedCommands");

        // Setup the Discord client's events
        this.setupEvents();

        Log.success("[Bot.setup] Bot setup completed");

        return this;
    }

    /**
     * @param {IFragment[]} fragments
     * @param {boolean} internal Whether the fragments are internal
     * @return {number} The amount of enabled fragments
     */
    private async enableFragments(fragments: IFragment[], internal: boolean = false): Promise<number> {
        let enabled: number = 0;

        for (let i: number = 0; i < fragments.length; i++) {
            if ((fragments[i] as any).prototype instanceof Command) {
                const fragment: any = new (fragments[i] as any)();

                // Command is not registered in primitive commands
                if (internal && !this.primitiveCommands.includes(fragment.meta.name)) {
                    continue;
                }

                // TODO: Add a way to disable the warning
                if (!internal && fragment.meta.name === "eval") {
                    Log.warn("Please beware that your eval command may be used in malicious ways and may lead to a full compromise of the local machine. To prevent this from happening, please use the default eval command included with Forge.");
                }

                // Overwrite command restrict with default values
                fragment.restrict = {
                    ...DefaultCommandRestrict,
                    ...fragment.restrict
                };

                if (await fragment.enabled()) {
                    this.commandStore.register(fragment);
                    enabled++;
                }
            }
            else if ((fragments[i] as any).prototype instanceof Service) {
                const service: any = fragments[i];

                this.services.register(new service({
                    bot: this,
                    api: this.getAPI()
                }));

                enabled++;
            }
            else {
                // TODO: Also add someway to identify the fragment
                Log.warn("[Bot.enableFragments] Unknown fragment instance, ignoring");
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

            if (this.options.consoleInterface && !this.console.ready) {
                // Setup the console command interface
                this.console.setup(this);
            }

            Log.info(`[Bot.setupEvents] Logged in as ${this.client.user.tag} | ${this.client.guilds.size} guild(s)`);

            const took: number = Math.round(performance.now() - this.setupStart);

            Log.success(`[Bot.setupEvents] Ready | Took ${took}ms`);
        });

        this.client.on("message", this.handleMessage.bind(this));
        this.client.on("error", (error: Error) => Log.error(error.message));

        // If enabled, handle message edits (if valid) as commands
        if (this.options.updateOnMessageEdit) {
            this.client.on("messageUpdate", async (oldMessage: Message, newMessage: Message) => {
                await this.handleMessage(newMessage, true);
            });
        }

        // Setup user events
        for (let i: number = 0; i < BotEvents.length; i++) {
            this.client.on(BotEvents[i].name, BotEvents[i].handler);
        }

        for (let i: number = 0; i < ChannelMessageEvents.length; i++) {
            this.client.on("message", (message: Message) => {
                if (message.channel.id === ChannelMessageEvents[i].name) {
                    ChannelMessageEvents[i].handler();
                }
            });
        }

        Log.success("[Bot.setupEvents] Discord events setup completed");
    }

    /**
     * @todo 'args' type on docs (here)
     * @param {string} base
     * @param {Message} referer
     * @param {*} args
     */
    public async triggerCommand(base: string, referer: Message, ...args: string[]): Promise<any> {
        // Use any registered prefix, default to index 0
        const content: string = `${this.settings.general.prefixes[0]}${base} ${args.join(" ")}`.trim();

        let command: Command | IDecoratorCommand | null = CommandParser.parse(
            content,
            this.commandStore,
            this.settings.general.prefixes
        );

        if (command === null) {
            Log.error("[Bot.handleCommandMessage] Failed parsing command");

            return;
        }

        if ((command as any).type !== undefined && typeof (command as any).type === "number" && DecoratorCommandType[(command as any).type] !== undefined) {
            Log.warn("[Bot.triggerCommand] Triggering weak, simple or decorator commands is not supported.");

            return;
        }

        command = command as Command;

        const rawArgs: IRawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content),
            schema: command.arguments,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun
            message: referer,
            command: command
        });

        // TODO: Debugging
        // Log.debug("raw args, ", rawArgs);

        return this.commandHandler.handle(
            this.createCommandContext(referer),
            command,
            rawArgs
        );
    }

    /**
     * @param {Message} message
     * @param {boolean} [edited=false] Whether the message was edited
     * @return {Promise<void>}
     */
    public async handleMessage(message: Message, edited: boolean = false): Promise<void> {
        this.statCounter.stats.messagesSeen++;

        if (this.suspended) {
            return;
        }

        this.emit("handleMessageStart");

        if (this.options.logMessages) {
            const names: any = {};

            if (message.channel.type === "text" && message.guild !== undefined) {
                names.guild = message.guild.name;
                names.channel = ` # ${(message.channel as TextChannel).name}`;
            }
            else if (message.channel.type === "dm" && message.guild === undefined) {
                names.guild = "";
                names.channel = "Direct Messages";
            }
            else {
                names.guild = "Unknown";
                names.channel = " # Unknown";
            }

            Log.info(`[${message.author.tag} @ ${names.guild}${names.channel}] ${Utils.cleanMessage(message)}${edited ? " [Edited]" : ""}`);
        }

        // TODO: Cannot do .startsWith with a prefix array
        if ((!message.author.bot || (message.author.bot && !this.options.ignoreBots)) /*&& message.content.startsWith(this.settings.general.prefix)*/ && CommandParser.validate(message.content, this.commandStore, this.settings.general.prefixes)) {
            if (this.options.allowCommandChain) {
                const rawChain: string[] = message.content.split("&");

                // TODO: Should be bot option
                const maxChainLength: number = 5;

                let allowed: boolean = true;

                if (rawChain.length > maxChainLength) {
                    allowed = false;
                    message.reply(`Maximum allowed chain length is ${maxChainLength} commands. Your commands were not executed.`);
                }

                if (allowed) {
                    const chain: string[] = rawChain.slice(0, maxChainLength);

                    // TODO: What if commandChecks is start and the bot tries to react twice or more?
                    for (let i: number = 0; i < chain.length; i++) {
                        await this.handleCommandMessage(message, chain[i].trim(), this.argumentResolvers);
                    }
                }
            }
            else {
                await this.handleCommandMessage(message, message.content, this.argumentResolvers);
            }
        }
        // TODO: ?prefix should also be chain-able
        else if (!message.author.bot && message.content === "?prefix" && this.prefixCommand) {
            message.channel.send(new RichEmbed()
                .setDescription(`Command prefix(es): **${this.settings.general.prefixes.join(", ")}** | Powered by [The Forge Framework](https://github.com/discord-forge/forge)`)
                .setColor("GREEN"));
        }
        // TODO: There should be an option to disable this
        // TODO: Use embeds
        // TODO: Verify that it was done in the same environment and that the user still has perms
        else if (!message.author.bot && message.content === "?undo") {
            if (!this.commandHandler.undoMemory.has(message.author.id)) {
                message.reply("You haven't performed any undoable action");
            }
            else if (this.commandHandler.undoAction(message.author.id, message)) {
                await message.reply("The action was successfully undone");
                this.commandHandler.undoMemory.delete(message.author.id);
            }
            else {
                await message.reply("The action failed to be undone");
            }
        }

        this.emit("handleMessageEnd");
    }

    /**
     * @param {Message} message
     * @return {CommandContext}
     */
    private createCommandContext(message: Message): CommandContext {
        return new CommandContext({
            message: message,
            // args: CommandParser.resolveArguments(CommandParser.getArguments(content), this.commandHandler.argumentTypes, resolvers, message),
            bot: this,

            // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review)
            // TODO: CRITICAL: Default access level set to 0
            emojis: this.emojis,
            label: CommandParser.getCommandBase(message.content, this.settings.general.prefixes)
        });
    }

    /**
     * @param {Message} message
     * @param {string} content
     * @param {*} resolvers
     * @return {Promise<void>}
     */
    public async handleCommandMessage(message: Message, content: string, resolvers: any): Promise<void> {
        this.emit("handleCommandMessageStart", message, content);

        let command: Command | IDecoratorCommand | null = CommandParser.parse(
            content,
            this.commandStore,
            this.settings.general.prefixes
        );

        if (command === null) {
            Log.error("[Bot.handleCommandMessage] Failed parsing command");

            return;
        }

        if ((command as any).type !== undefined && typeof (command as any).type === "number" && DecoratorCommandType[(command as any).type] !== undefined) {
            command = command as IDecoratorCommand;

            if (command.type === DecoratorCommandType.Simple) {
                // TODO: Simple commands have an empty array of arguments, which doesn't look good
                (command as SimpleCommand).executed(this.createCommandContext(message), [], this.api);

                return;
            }
            else if (command.type === DecoratorCommandType.Weak) {
                //
                Log.warn(`[Bot.handleCommandMessage] Weak commands are not yet implemented, ignoring execution for '${command.meta.name}'`);

                return;
            }
            else {
                Log.error(`[Bot.handleCommandMessage] Unexpected decorator command type: '${command.type}' for command '${command.meta.name}'`);

                return;
            }
        }

        command = command as Command;

        const rawArgs: IRawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content),
            schema: command.arguments,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun
            message: message,
            command: command
        });

        // TODO: Debugging
        //Log.debug("raw args, ", rawArgs);

        await this.commandHandler.handle(
            this.createCommandContext(message),
            command,
            rawArgs
        );

        this.emit("handleCommandMessageEnd", message, content);
    }

    /**
     * Connect the client
     * @return {Promise<this>}
     */
    public async connect(api?: ApiType): Promise<this> {
        await this.setup(api);
        Log.verbose("[Bot.connect] Starting");
        await this.client.login(this.settings.general.token);

        return this;
    }

    /**
     * @todo "Multiple instances" upon restarts may be caused because of listeners not getting removed (and re-attached)
     * @todo Use the reload modules param
     * Restart the client
     * @param {boolean} reloadModules Whether to reload all modules
     * @return {Promise<this>}
     */
    public async restart(reloadModules: boolean = true): Promise<this> {
        this.emit("restartStart", reloadModules);
        Log.verbose("[Bot.restart] Restarting");

        // Dispose resources
        await this.dispose();

        if (reloadModules) {
            // TODO: Actually reload all the features and commandStore
            // this.features.reloadAll(this);
            // TODO: New fragments system
            // await this.commandLoader.reloadAll();
        }

        await this.disconnect();
        await this.connect();
        this.emit("restartCompleted", reloadModules);

        return this;
    }

    /**
     * Disconnect the client
     * @return {Promise<this>}
     */
    public async disconnect(): Promise<this> {
        this.emit("disconnecting");
        await this.dispose();

        // Save data before exiting
        if (this.dataStore && this.dataStore instanceof JsonProvider) {
            Log.verbose("[Bot.disconnect] Saving JsonProvider");
            await this.dataStore.save();
        }

        // TODO
        //this.settings.save();
        await this.client.destroy();
        this.client = new Client();
        Log.info("[Bot.disconnect] Disconnected");
        this.emit("disconnected");

        return this;
    }

    /**
     * Clear all the files inside the temp folder
     */
    public clearTemp(): void {
        this.emit("clearingTemp");

        if (fs.existsSync("./temp")) {
            fs.readdir("./temp", (error: any, files: any) => {
                for (let i = 0; i < files.length; i++) {
                    fs.unlink(`./temp/${files[i]}`, (error: Error) => {
                        throw error;
                    });
                }
            });
        }

        this.emit("clearedTemp");
    }

    public async dispose(): Promise<void> {
        for (let i: number = 0; i < this.disposables.length; i++) {
            await this.disposables[i].dispose();
        }

        // Reset the temp folder before shutdown
        await this.temp.reset();

        await this.commandStore.disposeAll();
        await this.services.disposeAll();
        this.clearTemp();
    }
}
