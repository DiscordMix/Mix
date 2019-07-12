import {Client, Snowflake} from "discord.js";
import {EventEmitter} from "events";
import {ICustomArgType} from "../commands/command";
import {ICommandHandler} from "../commands/commandHandler";
import {IFragmentManager} from "../fragments/fragmentManager";
import Localisation from "./localisation";
import {IOptimizer} from "./optimizer";
import {IServiceManager} from "../services/serviceManager";
import {ITimeoutAttachable, IDisposable} from "../util/helpers";
import {IPathResolver} from "./pathResolver";
import {IBotAnalytics} from "./botAnalytics";
import {ITemp} from "./temp";
import {ICommandRegistry} from "../commands/commandRegistry";
import {IConsoleInterface} from "../console/consoleInterface";
import {ITaskManager} from "../tasks/taskManager";
import {PromiseOr} from "@atlas/xlib";
import {IBotHandler} from "./botHandler";
import {ArgumentType, ArgumentResolver} from "../commands/type";

export enum ChannelType {
    Text = "text",
    DM = "dm",
    Group = "group"
}

/**
 * Options to create a new bot instance.
 */
export interface IBotOptions {
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
     * Whether to send a DM (direct message) when
     * the help command is invoked.
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
     * Whether to attempt to apply a green checkmark
     * emoji on successfull commands.
     */
    readonly checkCommands: boolean;

    /**
     * The directory location(s) to scan for various
     * modules used by the bot, such as commands and services.
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
    LoadingTasks = "loadTasks",
    LoadedTasks = "loadedTasks",
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

export enum BotCoreEvent {
    Connected = "connected",
    Disconnected = "disconnected"
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

export interface IBot extends EventEmitter, IDisposable, ITimeoutAttachable {
    readonly options: IBotOptions;
    readonly temp: ITemp;
    readonly services: IServiceManager;
    readonly registry: ICommandRegistry;
    readonly commandHandler: ICommandHandler;
    readonly console: IConsoleInterface;
    readonly usePrefixCommand: boolean;
    readonly internalCommands: InternalCommand[];
    readonly owner?: Snowflake;
    readonly i18n?: Localisation;
    readonly argumentResolvers: Map<ArgumentType, ArgumentResolver>;
    readonly disposables: IDisposable[];
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
    readonly analytics: IBotAnalytics;
    readonly handle: IBotHandler;

    reload(): PromiseOr<this>;
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
