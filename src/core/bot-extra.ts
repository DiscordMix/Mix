import {Message} from "discord.js";
import {EventEmitter} from "events";
import {IArgumentResolver, ICustomArgType} from "../commands/command";
import {ICommandHandler} from "../commands/command-handler";
import {IFragmentManager} from "../fragments/fragment-manager";
import Language from "../language/language";
import {IServiceManager} from "../services/service-manager";
import {ITimeoutAttachable, IDisposable} from "./helpers";
import {ITemp} from "./temp";
import {ICommandRegistry} from "../commands/command-registry";
import {IConsoleInterface} from "../console/console-interface";
import {ITaskManager} from "../tasks/task-manager";
import {Reducer, IStore} from "../state/store";
import {PromiseOr} from "@atlas/xlib";
import {IUniversalClient} from "../universal/universal-client";
import {ISettings} from "./settings";

// TODO: Already made optional by Partial?
/**
 * Options to create a new bot instance.
 */
export interface IBotOptions<T = any> {
    readonly settings: ISettings;
    readonly extra?: Partial<IBotExtraOptions>;
    readonly argumentResolvers?: IArgumentResolver[];
    readonly argumentTypes?: ICustomArgType[];
    readonly languages?: string[];
    readonly initialState?: T;
    readonly reducers?: Reducer<T>[];
    readonly client: IUniversalClient;
}

export type Action<T = void> = () => T;

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
    readonly settings: ISettings;
    readonly temp: ITemp;
    readonly services: IServiceManager;
    readonly registry: ICommandRegistry;
    readonly commandHandler: ICommandHandler;
    readonly console: IConsoleInterface;
    readonly extraOpts: IBotExtraOptions;
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
    readonly store: IStore<TState, TActionType>;

    setState(state: BotState): this;
    setSuspended(suspend: boolean): this;
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
