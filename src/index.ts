import Bot from "./core/bot";
import ArgumentParser, {IArgumentParser} from "./commands/argument-parser";
import Context, {IContext, TextBasedChannel, IContextOptions} from "./commands/command-context";
import CommandStore, {CommandManagerEvent, ICommandStore} from "./commands/command-store";

import Command, {
    ArgumentTypeChecker,
    IArgument,
    TrivialArgType,
    ICustomArgType,
    IArgumentResolver,
    RestrictGroup,
    InternalArgType,
    GenericCommand,
    IGenericCommand
} from "./commands/command";

import ConsoleInterface, {IConsoleInterface} from "./console/console-interface";
import CommandParser from "./commands/command-parser";
import ConsoleCommand from "./console/console-command";
import BotBuilder, {IBotBuilder} from "./builders/bot-builder";
import EmbedBuilder from "./builders/embed-builder";
import ConfigBuilder, {IConfigBuilder} from "./builders/config-builder";
import MsgBuilder, {IMsgBuilder} from "./builders/msg-builder";
import EditableMessage from "./message/editable-message";
import Log, {LogLevel} from "./core/log";
import Rgb from "./misc/rgb";
import Rgba from "./misc/rgba";
import Settings, {ISettings} from "./core/settings";
import TimeParser from "./time/time-parser";
import TimeSuffixType from "./time/time-suffix-type";
import Utils from "./core/utils";
import Permission from "./core/permission";
import ChatEnvironment from "./core/chat-environment";
import List from "./collections/collection";
import SetupHelper, {ISetupHelperResult, ISetupHelper} from "./core/setup-helper";
import Service, {IServiceOptions, ForkedService, GenericService, ProcessMsgType, IProcessMsg, IGenericService, IService, IForkedService} from "./services/service";
import {on, WeakCommand, IDecoratorCommand, SimpleCommand, DiscordEvent} from "./decorators/decorators";
import {command} from "./decorators/decorators";
import Patterns from "./core/patterns";
import EmojiMenu, {IEmojiButton, IEmojiMenu} from "./emoji-menu/emoji-menu";
import {IDisposable} from "./core/helpers";
import PaginatedMessage from "./pagination/paginated-message";
import Task, {ITask} from "./tasks/task";
import TaskManager, {ITaskManager} from "./tasks/task-manager";
import {IAction, ActionType} from "./actions/action";
import ActionInterpreter, {IPaginatedActionArgs, IRequestActionArgs, IEmbedActionArgs, IPrivateMessageActionArgs, IMessageActionArgs, IActionInterpreter} from "./actions/action-interpreter";
import {IFragment, IFragmentMeta} from "./fragments/fragment";
import SMIS from "./services/smis";
import {ISerializer} from "./serializers/serializer";
import LogSerializer, {ILogSource, ILogMsg} from "./serializers/log-serializer";
import StateSerializer from "./serializers/state-serializer";
import UrlSerializer from "./serializers/url-serializer";
import UserSerializer from "./serializers/user-serializer";
import {IProvider, PromiseOr, IDuplexProvider, IQueriableProvider} from "./providers/provider";
import {GuildConfig, GuildCfgMongoProvider} from "./providers/mongo-providers";
import Store, {TestStoreActionType, IStoreAction, Reducer, ITestState, IStore} from "./state/store";
import {IBuilder} from "./builders/builder";
import {IBot, EBotEvents} from "./core/bot-extra";
import {TimeMachine, ITimeMachine} from "./state/time-machine";
import Delta from "./state/delta";
import {ICommandEvent} from "./events/command-event";

export {
    // Fragments
    IFragment,
    IFragmentMeta,

    // Commands
    ArgumentParser,
    IArgumentParser,
    Context,
    IContext,
    TextBasedChannel,
    IContextOptions,
    CommandStore,
    ICommandStore,
    CommandManagerEvent,
    CommandParser,
    IArgument,
    ICustomArgType,
    ArgumentTypeChecker,
    Command,
    GenericCommand,
    IGenericCommand,
    TrivialArgType,
    IArgumentResolver,
    RestrictGroup,
    InternalArgType,

    // Console
    ConsoleInterface,
    IConsoleInterface,
    ConsoleCommand,

    // Builder
    BotBuilder,
    IBotBuilder,
    EmbedBuilder,
    ConfigBuilder,
    IConfigBuilder,
    MsgBuilder,
    IMsgBuilder,
    IBuilder,

    // Core
    Bot,
    IBot,
    EditableMessage,
    Log,
    LogLevel,
    Rgb,
    Rgba,
    Settings,
    ISettings,
    TimeParser,
    TimeSuffixType,
    Utils,
    Permission,
    ChatEnvironment,
    Patterns,
    DiscordEvent,
    EBotEvents,

    // Collections
    List,

    // Emoji Menu
    IEmojiButton,
    EmojiMenu,
    IEmojiMenu,

    // Events
    ICommandEvent,

    // Setup Helper
    SetupHelper,
    ISetupHelper,
    ISetupHelperResult,

    // Services
    Service,
    IService,
    IServiceOptions,
    ForkedService,
    IForkedService,
    GenericService,
    IGenericService,

    // Misc
    PaginatedMessage,
    ProcessMsgType,
    IProcessMsg,
    SMIS,
    ILogMsg,
    ILogSource,
    PromiseOr,

    // Structures
    IDisposable,

    // Decorators
    on,
    command,
    WeakCommand,
    IDecoratorCommand,
    SimpleCommand,

    // Tasks
    Task,
    ITask,
    TaskManager,
    ITaskManager,

    // Actions
    IAction,
    ActionType,
    IActionInterpreter,
    ActionInterpreter,
    IPaginatedActionArgs,
    IRequestActionArgs,
    IPrivateMessageActionArgs,
    IEmbedActionArgs,
    IMessageActionArgs,

    // Serializers
    ISerializer,
    LogSerializer,
    StateSerializer,
    UrlSerializer,
    UserSerializer,

    // Providers
    IProvider,
    IDuplexProvider,
    IQueriableProvider,

    // Providers -> MongoDB
    GuildConfig,
    GuildCfgMongoProvider,

    // Store
    Store,
    IStore,
    TestStoreActionType,
    IStoreAction,
    TimeMachine,
    ITimeMachine,
    Reducer,
    ITestState,
    Delta
};