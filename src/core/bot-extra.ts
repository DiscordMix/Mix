import {Client, Snowflake} from "discord.js";
import {EventEmitter} from "events";
import {ICustomArgType} from "../commands/command";
import {ICommandHandler} from "../commands/command-handler";
import {IFragmentManager} from "../fragments/fragment-manager";
import Language from "../language/language";
import {IOptimizer} from "../optimization/optimizer";
import {IServiceManager} from "../services/service-manager";
import {ITimeoutAttachable, IDisposable} from "./helpers";
import {IPathResolver} from "./path-resolver";
import {IBotAnalytics} from "./bot-analytics";
import {ITemp} from "./temp";
import {ICommandRegistry} from "../commands/command-registry";
import {IConsoleInterface} from "../console/console-interface";
import {ITaskManager} from "../tasks/task-manager";
import ActionInterpreter from "../actions/action-interpreter";
import {Reducer, IStore} from "../state/store";
import {PromiseOr} from "@atlas/xlib";
import {IBotHandler} from "./bot-handler";
import {ArgumentType, ArgumentResolver} from "../commands/type";

/**
 * Options to create a new bot instance.
 */
export interface IBotOptions<T = any> {
    /**
     * The prefix(es) that will trigger commands.
     */
    readonly prefixes: string[];

    /**
     * Whether to use the internal '?prefix' command.
     */
    readonly usePrefixCommand: boolean;

    /**
     * Specify the internal commands to be loaded and enabled.
     */
    readonly internalCommands: InternalCommand[];

    /**
     * The owner of the bot. Used internally.
     */
    readonly owner?: Snowflake;

    /**
     * Whether to ignore all input from bots.
     */
    readonly ignoreBots: boolean;

    /**
     * Whether to log messages to the console.
     */
    readonly logMessages: boolean;

    /**
     * Whether to send a DM (direct message) when the help command is invoked.
     */
    readonly dmHelp: boolean;

    /**
     * Whether to use the internal bot optimization module.
     */
    readonly useOptimizer: boolean;

    /**
     * Whether to use the console interface module.
     */
    readonly useConsoleInterface: boolean;

    /**
     * Whether to attempt to apply a green checkmark emoji on successfull commands.
     */
    readonly checkCommands: boolean;

    /**
     * The directory location(s) to scan for various modules used by the bot, such as commands and services.
     */
    readonly paths: IBotPaths;

    /**
     * Various API keys to bot lists for automtic stat posting.
     */
    readonly keys: IBotKeys;

    readonly showAsciiTitle: boolean;
    readonly allowCommandChain: boolean;
    readonly updateOnMessageEdit: boolean;
    readonly autoDeleteCommands: boolean;
    readonly argumentResolvers: Map<ArgumentType, ArgumentResolver>;
    readonly argumentTypes: ICustomArgType[];
    readonly languages: string[];
    readonly initialState: T;
    readonly reducers: Reducer<T>[];
}

export interface IBotKeys {
    /**
     * The API key for DiscordBotList.org.
     */
    readonly dbl?: string;

    /**
     * The API key for BotsForDiscord.com.
     */
    readonly bfd?: string;
}

export interface IBotPaths {
    /**
     * The path to the commands directory.
     */
    readonly commands: string;

    /**
     * The path to the plugins directory.
     */
    readonly plugins: string;

    /**
     * The path to the services directory.
     */
    readonly services: string;

    /**
     * The path to the languages directory.
     */
    readonly languages: string;

    /**
     * The path to the tasks directory.
     */
    readonly tasks: string;
}

export type Action<T = void> = () => T;

/**
 * Events fired by the bot.
 */
export enum BotEvent {
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
    Command = "command",
    SuspensionStateChanged = "suspensionStateChanged"
}

/**
 * Possible states of the bot.
 */
export enum BotState {
    Disconnected,
    Connecting,
    Restarting,
    Connected
}

/**
 * A list of internal, built-in commands.
 */
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

/**
 * Represents a Discord bot token.
 */
export type BotToken = string;

/**
 * Represents a Discord account ID.
 */
export type Snowflake = string;

export interface IBot<TState = any, TActionType = any> extends EventEmitter, IDisposable, ITimeoutAttachable {
    readonly options: IBotOptions;
    readonly temp: ITemp;
    readonly services: IServiceManager;
    readonly registry: ICommandRegistry;
    readonly commandHandler: ICommandHandler;
    readonly console: IConsoleInterface;
    readonly prefixCommand: boolean;
    readonly internalCommands: InternalCommand[];
    readonly owner?: Snowflake;
    readonly language?: Language;
    readonly argumentResolvers: Map<ArgumentType, ArgumentResolver>;
    readonly disposables: IDisposable[];
    readonly actionInterpreter: ActionInterpreter;
    readonly tasks: ITaskManager;
    readonly timeouts: NodeJS.Timeout[];
    readonly intervals: NodeJS.Timeout[];
    readonly languages?: string[];
    readonly state: BotState;
    readonly suspended: boolean;
    readonly client: Client;
    readonly optimizer: IOptimizer;
    readonly fragments: IFragmentManager;
    readonly paths: IPathResolver;
    readonly store: IStore<TState, TActionType>;
    readonly analytics: IBotAnalytics;
    readonly handle: IBotHandler;

    setState(state: BotState): this;
    postStats(): PromiseOr<void>;
    setSuspended(suspend: boolean): this;
    clearTimeout(timeout: NodeJS.Timeout): boolean;
    clearAllTimeouts(): number;
    clearInterval(interval: NodeJS.Timeout): boolean;
    clearAllIntervals(): number;
    connect(): PromiseOr<this>;
    reconnect(reloadModules: boolean): PromiseOr<this>;
    disconnect(): PromiseOr<this>;
    clearTemp(): void;
}
