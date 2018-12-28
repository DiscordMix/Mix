// Setup environment variables
require("dotenv").config();

// TODO: Not working
export const DebugMode: boolean = process.env.FORGE_DEBUG_MODE == "true";

import CommandParser from "../commands/command-parser";
import CommandContext from "../commands/command-context";
import ConsoleInterface from "../console/console-interface";
import CommandStore from "../commands/command-store";
import Utils from "./utils";
import Settings from "./settings";
import Log from "./log";
import Temp from "./temp";
import Discord, {Client, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import ServiceManager from "../services/service-manager";
import axios from "axios";

import Command, {
    IArgumentResolver,
    ICustomArgType,
    RawArguments,
    UserGroup
} from "../commands/command";

import CommandHandler from "../commands/command-handler";
import fs from "fs";
import {performance} from "perf_hooks";
import path from "path";
import FragmentLoader, {IPackage} from "../fragments/fragment-loader";
import Language from "../language/language";

import {
    BotEvents,
    ChannelMessageEvents,
    IDecoratorCommand,
    DecoratorCommandType,
    DiscordEvent
} from "../decorators/decorators";

import StatCounter from "./stat-counter";
import {IDisposable, ITimeoutAttachable} from "./helpers";
import ActionInterpreter from "../actions/action-interpreter";
import TaskManager from "../tasks/task-manager";
import {EventEmitter} from "events";
import Optimizer from "../optimization/optimizer";
import FragmentManager from "../fragments/fragment-manager";
import PathResolver from "./path-resolver";
import {InternalArgResolvers, InternalArgTypes, Title, InternalFragmentsPath} from "./constants";
import Store, {Reducer} from "../state/store";
import BotMessages from "./messages";

// TODO: Already made optional by Partial?
export interface IBotOptions<T> {
    readonly settings: Settings;
    readonly prefixCommand?: boolean;
    readonly internalCommands?: InternalCommand[];
    readonly userGroups?: UserGroup[];
    readonly owner?: Snowflake;
    readonly options?: Partial<IBotExtraOptions>;
    readonly argumentResolvers?: IArgumentResolver[];
    readonly argumentTypes?: ICustomArgType[];
    readonly languages?: string[];
    readonly initialState?: T;
    readonly reducers?: Reducer<T>[];
}

export type Action<T = void> = () => T;

export const DefaultBotEmojiOptions: IBotEmojiOptions = {
    success: ":white_check_mark:",
    error: ":thinking:"
};

export interface IBotEmojiOptions {
    readonly success: string;
    readonly error: string;
}

/**
 * Extra options used by the bot
 */
export interface IBotExtraOptions {
    readonly asciiTitle: boolean;
    readonly consoleInterface: boolean;
    readonly allowCommandChain: boolean;
    readonly updateOnMessageEdit: boolean;
    readonly checkCommands: boolean;
    readonly autoDeleteCommands: boolean;
    readonly ignoreBots: boolean;
    readonly autoResetAuthStore: boolean;
    readonly logMessages: boolean;
    readonly dmHelp: boolean;
    readonly emojis: IBotEmojiOptions;
    readonly optimizer: boolean;
}

const DefaultBotOptions: IBotExtraOptions = {
    allowCommandChain: true,
    autoDeleteCommands: false,
    checkCommands: true,
    ignoreBots: true,
    updateOnMessageEdit: false,
    asciiTitle: true,
    autoResetAuthStore: false,
    dmHelp: true,
    logMessages: false,
    emojis: DefaultBotEmojiOptions,
    consoleInterface: true,
    optimizer: false
};

/**
 * Events fired by the bot
 */
export enum EBotEvents {
    SetupStart = "setupStart",
    LoadingInternalFragments = "loadInternalFragments",
    LoadedInternalFragments = "loadedInternalFragments",
    LoadingServices = "loadServices",
    LoadedServices = "loadedServices",
    LoadingCommands = "loadCommands",
    LoadedCommands = "loadedCommands",
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
 * Possible states of the bot
 */
export enum BotState {
    Disconnected,
    Connecting,
    Restarting,
    Suspended,
    Connected
}

export enum InternalCommand {
    CLI = "cli",
    Eval = "eval",
    Help = "help",
    Ping = "ping",
    Prefix = "prefix",
    Reflect = "reflect",
    Restart = "restart",
    Throw = "throw",
    Usage = "usage"
}

export type BotToken = string;

/**
 * Bot events:
 *
 * - setupStart(LibType?)
 * - loadInternalFragments()
 * - loadedInternalFragments(Fragment[]?)
 * - loadServices()
 * - loadedServices()
 * - loadCommands()
 * - loadedCommands()
 * - ready()
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
 * - handlingCommand(CommandContext, Command, Arguments Object)
 * - commandError(Error)
 * - commandExecuted(CommandExecutedEvent, command result (any))
 */

// TODO: Should emit an event when state changes
/**
 * @extends EventEmitter
 */
export default class Bot<TState = any, TActionType = any, TLib = any> extends EventEmitter implements IDisposable, ITimeoutAttachable {
    public readonly settings: Settings;
    public readonly temp: Temp;
    public readonly services: ServiceManager;
    public readonly commandStore: CommandStore;
    public readonly commandHandler: CommandHandler;
    public readonly console: ConsoleInterface;
    public readonly prefixCommand: boolean;
    public readonly internalCommands: InternalCommand[];
    public readonly userGroups: UserGroup[];
    public readonly owner?: Snowflake;
    public readonly options: IBotExtraOptions;
    public readonly language?: Language;
    public readonly argumentResolvers: IArgumentResolver[];
    public readonly argumentTypes: ICustomArgType[];
    public readonly disposables: IDisposable[];
    public readonly actionInterpreter: ActionInterpreter;
    public readonly tasks: TaskManager;
    public readonly timeouts: NodeJS.Timeout[];
    public readonly intervals: NodeJS.Timeout[];
    public readonly languages?: string[];
    public readonly state: BotState;
    public readonly suspended: boolean;
    public readonly client: Client;
    public readonly tempoEngine: Optimizer;
    public readonly fragments: FragmentManager;
    public readonly paths: PathResolver;
    public readonly store: Store<TState, TActionType>;

    protected setupStart: number = 0;

    // TODO: Implement stat counter
    protected readonly statCounter: StatCounter;

    /**
     * Setup the bot from an object
     * @param {Partial<IBotOptions> | BotToken} botOptionsOrToken
     * @param {boolean} [testMode=false]
     */
    public constructor(botOptionsOrToken: Partial<IBotOptions<TState>> | BotToken, testMode: boolean = false) {
        super();

        let options: Partial<IBotOptions<TState>> = typeof botOptionsOrToken === "object" && botOptionsOrToken !== null && !Array.isArray(botOptionsOrToken) ? Object.assign({}, botOptionsOrToken) : (typeof botOptionsOrToken === "string" ? {
            settings: new Settings({
                general: {
                    prefixes: ["!"],
                    token: botOptionsOrToken
                }
            })
        } : undefined as any);

        if (testMode) {
            (options.options as any) = {
                ...options.options,
                asciiTitle: false,
                consoleInterface: false
            };

            (options.settings as any).paths = {
                commands: path.resolve(path.join(__dirname, "../", "test", "test-commands")),
                emojis: path.resolve(path.join(__dirname, "../", "test", "test-emojis")),
                languages: path.resolve(path.join("src", "test", "test-languages")),
                plugins: path.resolve(path.join(__dirname, "../", "test", "test-plugins")),
                services: path.resolve(path.join(__dirname, "../", "test", "test-services")),
                tasks: path.resolve(path.join(__dirname, "../", "test", "test-tasks")),
            };

            options = {
                ...options,
                internalCommands: [InternalCommand.Help, InternalCommand.Usage, InternalCommand.Ping],
                languages: ["test-language"],
            };
        }

        if (!options || !options.settings || typeof options.settings !== "object") {
            throw new Error(BotMessages.SETUP_INVALID);
        }

        /**
         * @type {Store}
         * @readonly
         */
        this.store = new Store<TState, TActionType>(options.initialState, options.reducers);

        /**
         * @type {BotState}
         * @readonly
         */
        this.state = BotState.Disconnected;

        /**
         * @type {Settings}
         * @readonly
         */
        this.settings = options.settings;

        /**
         * @type {PathResolver}
         * @readonly
         */
        this.paths = new PathResolver(this.settings.paths);

        /**
         * @todo Temporary hard-coded user id
         * @type {Temp}
         * @readonly
         */
        this.temp = new Temp();

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
        this.argumentResolvers = InternalArgResolvers;

        if (options.argumentResolvers) {
            this.argumentResolvers = [
                ...this.argumentResolvers,
                ...options.argumentResolvers
            ];
        }

        /**
         * @type {ICustomArgType[]}
         * @readonly
         */
        this.argumentTypes = InternalArgTypes;

        if (options.argumentTypes) {
            this.argumentTypes = [
                ...this.argumentTypes,
                ...options.argumentTypes
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
        this.prefixCommand = options.prefixCommand || true;

        /**
         * @todo Even if it's not specified here, the throw command was loaded, verify that ONLY specific trivials can be loaded?
         * @type {InternalCommand[]}
         * @readonly
         */
        this.internalCommands = options.internalCommands || [
            InternalCommand.CLI,
            InternalCommand.Eval,
            InternalCommand.Help,
            InternalCommand.Ping,
            InternalCommand.Prefix,
            InternalCommand.Reflect,
            InternalCommand.Restart,
            InternalCommand.Throw,
            InternalCommand.Usage
        ];

        /**
         * @type {IBotExtraOptions}
         * @readonly
         */
        this.options = {
            ...DefaultBotOptions,
            ...options.options,
        };

        // TODO: Make use of the userGroups property
        /**
         * @type {UserGroup[]}
         * @readonly
         */
        this.userGroups = options.userGroups || [];

        /**
         * @type {Snowflake | undefined}
         * @readonly
         */
        this.owner = options.owner;

        /**
         * Localization
         * @type {Language | undefined}
         * @readonly
         */
        this.language = this.settings.paths.languages ? new Language(this.settings.paths.languages) : undefined;

        /**
         * @type {string[] | undefined}
         * @readonly
         */
        this.languages = options.languages;

        /**
         * Whether the bot is suspended
         * @type {boolean}
         */
        this.suspended = false;

        /**
         * Used for measuring interaction with the bot
         * @type {StatCounter}
         */
        this.statCounter = new StatCounter();

        /**
         * A list of disposable objects
         * @type {IDisposable[]}
         * @protected
         * @readonly
         */
        this.disposables = [];

        /**
         * @type {ActionInterpreter}
         * @readonly
         */
        this.actionInterpreter = new ActionInterpreter(this);

        /**
         * Task manager for managing tasks
         * @type {TaskManager}
         * @readonly
         */
        this.tasks = new TaskManager(this);

        /**
         * A list of attached timeouts
         * @type {NodeJS.Timeout[]}
         * @readonly
         */
        this.timeouts = [];

        /**
         * A list of attached intervals
         * @type {NodeJS.Timeout[]}
         * @readonly
         */
        this.intervals = [];

        /**
         * Optimization engine for large bots
         * @type {Optimizer}
         * @readonly
         */
        this.tempoEngine = new Optimizer(this);

        /**
         * Fragment manager
         * @type {FragmentManager}
         * @readonly
         */
        this.fragments = new FragmentManager(this);

        return this;
    }

    /**
     * Post stats to various bot lists
     */
    public async postStats(): Promise<void> {
        if (!this.client.user || Object.keys(this.settings.keys).length === 0) {
            return;
        }

        const server_count: number = this.client.guilds.size;

        // Discord Bot List.org
        if (this.settings.keys.dbl) {
            const dblUrl: string = "https://discordbots.org/api/bots/{botId}/stats";

            await axios.post(dblUrl.replace("{botId}", this.client.user.id), {
                server_count
            }, {
                    headers: {
                        Authorization: this.settings.keys.dbl
                    }
                }).catch((error: Error) => {
                    Log.warn(`[Bot.postStats] Could not post stats to discordbots.org (${error.message})`);
                });
        }

        // Bots for Discord.com
        if (this.settings.keys.bfd) {
            const bfdUrl: string = "https://botsfordiscord.com/api/bot/{botId}";

            await axios.post(bfdUrl.replace("{botId}", this.client.user.id), {
                server_count
            }, {
                    headers: {
                        Authorization: this.settings.keys.bfd,
                        "Content-Type": "application/json"
                    }
                }).catch((error: Error) => {
                    Log.warn(`[Bot.postStats] Could not post stats to botsfordiscord.com (${error.message})`);
                });
        }
    }

    /**
     * Setup the bot
     * @param {TLib | undefined} lib
     * @return {Promise<this>}
     */
    protected async setup(lib?: TLib): Promise<this> {
        this.emit(EBotEvents.SetupStart, lib);

        if (this.options.asciiTitle) {
            console.log("\n" + Title.replace("{version}", "beta") + "\n");
        }

        if (DebugMode) {
            Log.info("[Forge] Debug mode is enabled");
        }

        /**
         * @type {number}
         * @protected
         */
        this.setupStart = performance.now();

        // Load languages
        if (this.language && this.languages) {
            for (let i: number = 0; i < this.languages.length; i++) {
                await this.language.load(this.languages[i]);
            }
        }

        Log.verbose("[Bot.setup] Attempting to load internal fragments");
        this.emit(EBotEvents.LoadingInternalFragments);

        // Load & enable internal fragments
        const internalFragmentCandidates: string[] | null = await FragmentLoader.pickupCandidates(InternalFragmentsPath);

        if (!internalFragmentCandidates) {
            throw new Error(BotMessages.SETUP_FAIL_LOAD_FRAGMENTS);
        }

        if (internalFragmentCandidates.length > 0) {
            Log.verbose(`[Bot.setup] Loading ${internalFragmentCandidates.length} internal fragments`);
        }
        else {
            Log.warn(BotMessages.SETUP_NO_FRAGMENTS_DETECTED);
        }

        const internalFragments: IPackage[] | null = await FragmentLoader.loadMultiple(internalFragmentCandidates);

        if (!internalFragments || internalFragments.length === 0) {
            Log.warn(BotMessages.SETUP_NO_FRAGMENTS_LOADED);
        }
        else {
            const enabled: number = await this.fragments.enableMultiple(internalFragments, true);

            if (enabled === 0) {
                Log.warn(BotMessages.SETUP_NO_FRAGMENTS_ENABLED);
            }
            else {
                Log.success(`[Bot.setup] Enabled ${enabled}/${internalFragments.length} internal fragments`);
            }
        }

        this.emit(EBotEvents.LoadedInternalFragments, internalFragments || []);
        this.emit(EBotEvents.LoadingServices);

        // Load & enable services
        const consumerServiceCandidates: string[] | null = await FragmentLoader.pickupCandidates(this.settings.paths.services);

        if (!consumerServiceCandidates || consumerServiceCandidates.length === 0) {
            Log.verbose(`[Bot.setup] No services were detected under '${this.settings.paths.services}'`);
        }
        else {
            Log.verbose(`[Bot.setup] Loading ${consumerServiceCandidates.length} service(s)`);

            const servicesLoaded: IPackage[] | null = await FragmentLoader.loadMultiple(consumerServiceCandidates);

            if (!servicesLoaded || servicesLoaded.length === 0) {
                Log.warn(BotMessages.SETUP_NO_SERVICES_LOADED);
            }
            else {
                Log.success(`[Bot.setup] Loaded ${servicesLoaded.length} service(s)`);
                await this.fragments.enableMultiple(servicesLoaded);
            }
        }

        // After loading services, enable all of them
        // TODO: Returns amount of enabled services
        await this.services.startAll();

        this.emit(EBotEvents.LoadedServices);
        this.emit(EBotEvents.LoadingCommands);

        // Load & enable consumer command fragments
        const consumerCommandCandidates: string[] | null = await FragmentLoader.pickupCandidates(this.settings.paths.commands);

        if (!consumerCommandCandidates || consumerCommandCandidates.length === 0) {
            Log.warn(`[Bot.setup] No commands were detected under '${this.settings.paths.commands}'`);
        }
        else {
            Log.verbose(`[Bot.setup] Loading ${consumerCommandCandidates.length} command(s)`);

            const commandsLoaded: IPackage[] | null = await FragmentLoader.loadMultiple(consumerCommandCandidates);

            if (!commandsLoaded || commandsLoaded.length === 0) {
                Log.warn(BotMessages.SETUP_NO_COMMANDS_LOADED);
            }
            else {
                const enabled: number = await this.fragments.enableMultiple(commandsLoaded);

                if (enabled > 0) {
                    Log.success(`[Bot.setup] Enabled ${commandsLoaded.length}/${consumerCommandCandidates.length} command(s)`);
                }
                else {
                    Log.warn(BotMessages.SETUP_NO_COMMANDS_ENABLED);
                }
            }
        }

        // Load & enable tasks
        await this.tasks.unregisterAll();
        Log.verbose(BotMessages.SETUP_LOADING_TASKS);

        const loaded: number = await this.tasks.loadAll(this.settings.paths.tasks);

        if (loaded > 0) {
            Log.success(`[Bot.setup] Loaded ${loaded} task(s)`);

            const enabled: number = this.tasks.enableAll();

            if (enabled > 0) {
                Log.success(`[Bot.setup] Triggered ${enabled}/${loaded} task(s)`);
            }
            else if (enabled === 0 && loaded > 0) {
                Log.warn(BotMessages.SETUP_NO_TASKS_TRIGGERED);
            }
        }
        else {
            Log.verbose(BotMessages.SETUP_NO_TASKS_FOUND);
        }

        this.emit(EBotEvents.LoadedCommands);

        if (this.options.optimizer) {
            Log.verbose(BotMessages.SETUP_START_OPTIMIZER);

            // Start tempo engine
            this.tempoEngine.start();

            Log.success(BotMessages.SETUP_STARTED_OPTIMIZER);
        }

        // Setup the Discord client's events
        this.setupEvents();

        Log.success(BotMessages.SETUP_COMPLETED);

        return this;
    }

    /**
     * @param {boolean} suspend
     * @return {this}
     */
    public suspend(suspend: boolean): this {
        if (this.state !== BotState.Connected) {
            return this;
        }
        else if (this.suspended !== suspend) {
            (this.suspended as any) = suspend;
            this.setState(this.suspended ? BotState.Suspended : BotState.Connected);
        }

        return this;
    }

    /**
     * Setup the client's events
     */
    protected setupEvents(): void {
        Log.verbose("[Bot.setupEvents] Setting up Discord events");

        // Discord client events
        this.client.on(DiscordEvent.Ready, async () => {
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

            Log.success(`[Bot.setupEvents] Ready | Took ${took}ms | PID ${process.pid}`);
            this.setState(BotState.Connected);
            this.emit(EBotEvents.Ready);
        });

        this.client.on(DiscordEvent.Message, this.handleMessage.bind(this));
        this.client.on(DiscordEvent.Error, (error: Error) => Log.error(error.message));

        // If enabled, handle message edits (if valid) as commands
        if (this.options.updateOnMessageEdit) {
            this.client.on(DiscordEvent.MessageUpdated, async (oldMessage: Message, newMessage: Message) => {
                await this.handleMessage(newMessage, true);
            });
        }

        // Setup user events
        for (let i: number = 0; i < BotEvents.length; i++) {
            this.client.on(BotEvents[i].name, BotEvents[i].handler);
        }

        for (let i: number = 0; i < ChannelMessageEvents.length; i++) {
            this.client.on(DiscordEvent.Message, (message: Message) => {
                if (message.channel.id === ChannelMessageEvents[i].name) {
                    ChannelMessageEvents[i].handler();
                }
            });
        }

        Log.success("[Bot.setupEvents] Discord events setup completed");
    }

    /**
     * Directly trigger a command
     * @todo 'args' type on docs (here)
     * @param {string} base
     * @param {Message} referer
     * @param {string[]} args
     * @return {Promise<*>}
     */
    public async triggerCommand(base: string, referer: Message, ...args: string[]): Promise<any> {
        // Use any registered prefix, default to index 0
        const content: string = `${this.settings.general.prefixes[0]}${base} ${args.join(" ")}`.trim();

        let command: Command | IDecoratorCommand | null = await CommandParser.parse(
            content,
            this.commandStore,
            this.settings.general.prefixes
        );

        if (command === null) {
            throw Log.error("[Bot.handleCommandMessage] Failed parsing command; Command is null");
        }

        if ((command as any).type !== undefined && typeof (command as any).type === "number" && DecoratorCommandType[(command as any).type] !== undefined) {
            Log.warn("[Bot.triggerCommand] Triggering weak, simple or decorator commands is not supported.");

            return;
        }

        command = command as Command;

        const rawArgs: RawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content, command.arguments),
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
     * Set a timeout
     * @param {Action} action
     * @param {number} time
     * @return {NodeJS.Timeout}
     */
    public setTimeout(action: Action, time: number): NodeJS.Timeout {
        const timeout: NodeJS.Timeout = setTimeout(() => {
            action();
            this.clearTimeout(timeout);
        }, time);

        this.timeouts.push(timeout);

        return timeout;
    }

    /**
     * Clear a timeout
     * @param {NodeJS.Timeout} timeout
     * @return {boolean} Whether the timeout was cleared
     */
    public clearTimeout(timeout: NodeJS.Timeout): boolean {
        const index: number = this.timeouts.indexOf(timeout);

        if (index !== -1) {
            clearTimeout(this.timeouts[index]);
            this.timeouts.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * Clear all timeouts
     * @return {number} The amount of timeouts cleared
     */
    public clearAllTimeouts(): number {
        let cleared: number = 0;

        for (let i: number = 0; i < this.timeouts.length; i++) {
            if (this.clearTimeout(this.timeouts[i])) {
                cleared++;
            }
        }

        return cleared;
    }

    /**
     * @param {Action} action
     * @param {number} time
     */
    public setInterval(action: any, time: number): NodeJS.Timeout {
        const interval: any = setInterval(action, time);

        this.intervals.push(interval);

        return interval;
    }

    /**
     * @param {NodeJS.Timeout} interval
     * @return {boolean} Whether the interval was cleared
     */
    public clearInterval(interval: NodeJS.Timeout): boolean {
        const index: number = this.timeouts.indexOf(interval);

        if (index !== -1) {
            clearTimeout(this.intervals[index]);
            this.intervals.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * Clear all attached intervals
     * @return {number} The amount of cleared intervals
     */
    public clearAllIntervals(): number {
        let cleared: number = 0;

        for (let i: number = 0; i < this.intervals.length; i++) {
            if (this.clearInterval(this.intervals[i])) {
                cleared++;
            }
        }

        return cleared;
    }

    /**
     * @param {Message} msg
     * @param {boolean} [edited=false] Whether the message was edited
     * @return {Promise<boolean>}
     */
    public async handleMessage(msg: Message, edited: boolean = false): Promise<boolean> {
        if (Utils.isEmpty(msg) || typeof msg !== "object" || !(msg instanceof Message) || Array.isArray(msg)) {
            return false;
        }

        this.statCounter.stats.messagesSeen++;

        if (this.suspended) {
            return false;
        }

        this.emit(EBotEvents.HandleMessageStart);

        if (this.options.logMessages) {
            const names: any = {};

            if (msg.channel.type === "text" && msg.guild !== undefined) {
                names.guild = msg.guild.name;
                names.channel = ` # ${(msg.channel as TextChannel).name}`;
            }
            else if (msg.channel.type === "dm" && msg.guild === undefined) {
                names.guild = "";
                names.channel = "Direct Messages";
            }
            else {
                names.guild = "Unknown";
                names.channel = " # Unknown";
            }

            Log.info(`[${msg.author.tag} @ ${names.guild}${names.channel}] ${Utils.cleanMessage(msg)}${edited ? " [Edited]" : ""}`);
        }

        // TODO: Cannot do .startsWith with a prefix array
        if ((!msg.author.bot || (msg.author.bot && !this.options.ignoreBots)) /*&& message.content.startsWith(this.settings.general.prefix)*/ && CommandParser.validate(msg.content, this.commandStore, this.settings.general.prefixes)) {
            if (this.options.allowCommandChain) {
                // TODO: Might split values too
                const rawChain: string[] = msg.content.split("~");

                // TODO: Should be bot option
                const maxChainLength: number = 5;

                let allowed: boolean = true;

                if (rawChain.length > maxChainLength) {
                    allowed = false;
                    msg.reply(`Maximum allowed chain length is ${maxChainLength} commands. Your commands were not executed.`);
                }

                if (allowed) {
                    const chain: string[] = rawChain.slice(0, maxChainLength);

                    // TODO: What if commandChecks is start and the bot tries to react twice or more?
                    for (let i: number = 0; i < chain.length; i++) {
                        await this.handleCommandMessage(msg, chain[i].trim(), this.argumentResolvers);
                    }
                }
            }
            else {
                await this.handleCommandMessage(msg, msg.content, this.argumentResolvers);
            }
        }
        // TODO: ?prefix should also be chain-able
        else if (!msg.author.bot && msg.content === "?prefix" && this.prefixCommand) {
            await msg.channel.send(new RichEmbed()
                .setDescription(`Command prefix(es): **${this.settings.general.prefixes.join(", ")}** | Powered by [The Forge Framework](https://github.com/discord-forge/forge)`)
                .setColor("GREEN"));
        }
        // TODO: There should be an option to disable this
        // TODO: Use embeds
        // TODO: Verify that it was done in the same environment and that the user still has perms
        else if (!msg.author.bot && msg.content === "?undo") {
            if (!this.commandHandler.undoMemory.has(msg.author.id)) {
                await msg.reply("You haven't performed any undoable action");
            }
            else if (this.commandHandler.undoAction(msg.author.id, msg)) {
                await msg.reply("The action was successfully undone");
                this.commandHandler.undoMemory.delete(msg.author.id);
            }
            else {
                await msg.reply("The action failed to be undone");
            }
        }

        this.emit(EBotEvents.HandleMessageEnd);

        return true;
    }

    /**
     * @param {Message} msg
     * @return {CommandContext}
     */
    protected createCommandContext(msg: Message): CommandContext {
        return new CommandContext({
            msg,
            // args: CommandParser.resolveArguments(CommandParser.getArguments(content), this.commandHandler.argumentTypes, resolvers, message),
            bot: this,

            // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review)

            label: CommandParser.getCommandBase(msg.content, this.settings.general.prefixes)
        });
    }

    /**
     * @todo Investigate the resolvers parameter usage (is it even used or required?)
     * @param {Message} message
     * @param {string} content
     * @param {*} resolvers
     * @return {Promise<void>}
     */
    public async handleCommandMessage(message: Message, content: string, resolvers: any): Promise<void> {
        this.emit(EBotEvents.HandleCommandMessageStart, message, content);

        let command: Command | null = await CommandParser.parse(
            content,
            this.commandStore,
            this.settings.general.prefixes
        );

        if (command === null) {
            throw Log.error("[Bot.handleCommandMessage] Failed parsing command; Command is null");
        }

        const rawArgs: RawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content, command.arguments),
            schema: command.arguments,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun
            message,
            command
        });

        // TODO: Debugging
        Log.debug("Raw arguments are", rawArgs);

        await this.commandHandler.handle(
            this.createCommandContext(message),
            command,
            rawArgs
        );

        this.emit(EBotEvents.HandleCommandMessageEnd, message, content);
    }

    /**
     * Connect the client
     * @param {TLib | undefined} lib
     * @return {Promise<this>}
     */
    public async connect(lib?: TLib): Promise<this> {
        this.setState(BotState.Connecting);
        await this.setup(lib);
        Log.verbose("[Bot.connect] Starting");

        await this.client.login(this.settings.general.token).catch(async (error: Error) => {
            if (error.message === "Incorrect login details were provided.") {
                Log.error("[Bot.connect] The provided token is invalid or has been regenerated");
                await this.disconnect();
                process.exit(0);
            }
            else {
                throw error;
            }
        });

        return this;
    }

    protected setState(state: BotState): this {
        (this.state as any) = state;

        return this;
    }

    /**
     * @todo "Multiple instances" upon restarts may be caused because of listeners not getting removed (and re-attached)
     * @todo Use the reload modules param
     * Restart the client
     * @param {boolean} [reloadModules=true] Whether to reload all modules
     * @return {Promise<this>}
     */
    public async restart(reloadModules: boolean = true): Promise<this> {
        this.emit(EBotEvents.Restarting, reloadModules);
        Log.verbose("[Bot.restart] Restarting");

        // Dispose resources
        await this.dispose();

        // Disconnect the bot
        await this.disconnect();

        if (reloadModules) {
            const commands: number = this.commandStore.getAll().size;

            Log.verbose(`[Bot.restart] Reloading ${commands} command(s)`);

            const reloaded: number = await this.commandStore.reloadAll();

            Log.success(`[Bot.restart] Reloaded ${reloaded}/${commands} command(s)`);
        }

        await this.connect();
        this.emit(EBotEvents.Restarted, reloadModules);

        return this;
    }

    /**
     * Disconnect the client
     * @return {Promise<this>}
     */
    public async disconnect(): Promise<this> {
        this.emit(EBotEvents.Disconnecting);

        const servicesStopped: number = await this.services.stopAll();

        Log.verbose(`[Bot.disconnect] Stopped ${servicesStopped} service(s)`);

        await this.dispose();
        await this.client.destroy();
        (this.client as any) = new Client();
        Log.info("[Bot.disconnect] Disconnected");
        this.emit(EBotEvents.Disconnected);

        return this;
    }

    /**
     * Clear all the files inside the temp folder
     */
    public clearTemp(): void {
        this.emit(EBotEvents.ClearingTemp);

        // TODO: Path may need to be resolved/maybe it wont be relative...
        if (fs.existsSync("./temp")) {
            fs.readdir("./temp", (error: any, files: any) => {
                for (let i = 0; i < files.length; i++) {
                    fs.unlink(`./temp/${files[i]}`, (error: Error) => {
                        throw error;
                    });
                }
            });
        }

        this.emit(EBotEvents.ClearedTemp);
    }

    /**
     * Dispose the bot's resources
     */
    public async dispose(): Promise<void> {
        for (let i: number = 0; i < this.disposables.length; i++) {
            await this.disposables[i].dispose();
        }

        // Reset the temp folder before shutdown
        await this.temp.reset();

        this.clearAllTimeouts();
        this.clearAllIntervals();
        await this.commandStore.disposeAll();
        await this.services.disposeAll();
        await this.services.stopAllForks();
        this.clearTemp();
    }
}
