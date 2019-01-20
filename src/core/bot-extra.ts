import {Client, Message} from "discord.js";
import {EventEmitter} from "events";
import {IArgumentResolver, ICustomArgType} from "../commands/command";
import {ICommandHandler} from "../commands/command-handler";
import {IFragmentManager} from "../fragments/fragment-manager";
import Language, {ILanguage} from "../language/language";
import {IOptimizer} from "../optimization/optimizer";
import {IServiceManager} from "../services/service-manager";
import {ITimeoutAttachable, IDisposable} from "./helpers";
import {IPathResolver} from "./path-resolver";
import {IStatsCounter} from "./stat-counter";
import {ITemp} from "./temp";
import {ICommandRegistry} from "../commands/command-store";
import {IConsoleInterface} from "../console/console-interface";
import {ITaskManager} from "../tasks/task-manager";
import {IActionInterpreter} from "../actions/action-interpreter";
import {Reducer, IStore} from "../state/store";
import {IDiscordSettings} from "../universal/discord/discord-settings";
import {PromiseOr} from "@atlas/xlib";
import {IUniversalClient} from "../universal/universal-client";

/**
 * Modules that will be used by the bot.
 */
export interface IBotModules {
    readonly store: IStore;
    readonly paths: IPathResolver;
    readonly temp: ITemp;
    readonly client: Client;
    readonly serviceManager: IServiceManager;
    readonly commandStore: ICommandRegistry;
    readonly commandHandler: ICommandHandler;
    readonly consoleInterface: IConsoleInterface;
    readonly language: ILanguage;
    readonly statsCounter: IStatsCounter;
    readonly actionInterpreter: IActionInterpreter;
    readonly taskManager: ITaskManager;
    readonly optimizer: IOptimizer;
    readonly fragmentManager: IFragmentManager;
}

// TODO: Already made optional by Partial?
/**
 * Options to create a new bot instance.
 */
export interface IBotOptions<T = any> {
    readonly settings: IDiscordSettings;
    readonly options?: Partial<IBotExtraOptions>;
    readonly argumentResolvers?: IArgumentResolver[];
    readonly argumentTypes?: ICustomArgType[];
    readonly languages?: string[];
    readonly initialState?: T;
    readonly reducers?: Reducer<T>[];
}

export type Action<T = void> = () => T;

export interface IBotEmojiOptions {
    readonly success: string;
    readonly error: string;
}

/**
 * Extra options used by the bot.
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
    Command = "command"
}

/**
 * Possible states of the bot.
 */
export enum BotState {
    Disconnected,
    Connecting,
    Restarting,
    Suspended,
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
export type DiscordBotToken = string;

/**
 * Represents a Discord account ID.
 */
export type DiscordSnowflake = string;

export interface IBot<TState = any, TActionType = any> extends EventEmitter, IDisposable, ITimeoutAttachable {
    readonly settings: IDiscordSettings;
    readonly temp: ITemp;
    readonly services: IServiceManager;
    readonly registry: ICommandRegistry;
    readonly commandHandler: ICommandHandler;
    readonly console: IConsoleInterface;
    readonly internalCommands: InternalCommand[];
    readonly options: IBotExtraOptions;
    readonly language?: Language;
    readonly argumentResolvers: IArgumentResolver[];
    readonly argumentTypes: ICustomArgType[];
    readonly disposables: IDisposable[];
    readonly tasks: ITaskManager;
    readonly timeouts: NodeJS.Timeout[];
    readonly intervals: NodeJS.Timeout[];
    readonly languages?: string[];
    readonly state: BotState;
    readonly suspended: boolean;
    readonly client: IUniversalClient;
    readonly fragments: IFragmentManager;
    readonly paths: IPathResolver;
    readonly store: IStore<TState, TActionType>;

    setState(state: BotState): this;
    suspend(suspend: boolean): this;
    invokeCommand(base: string, referer: Message, ...args: string[]): PromiseOr<any>;
    clearTimeout(timeout: NodeJS.Timeout): boolean;
    clearAllTimeouts(): number;
    clearInterval(interval: NodeJS.Timeout): boolean;
    clearAllIntervals(): number;
    handleMessage(msg: Message, edited: boolean): PromiseOr<boolean>;
    handleCommandMessage(message: Message, content: string, resolvers: any): PromiseOr<void>;
    connect(): PromiseOr<this>;
    restart(reloadModules: boolean): PromiseOr<this>;
    disconnect(): PromiseOr<this>;
    clearTemp(): void;
}
