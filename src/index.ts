import Bot from "./core/bot";
import ArgumentParser from "./commands/argument-parser";
import CommandContext from "./commands/command-context";
import CommandStore, {CommandManagerEvent} from "./commands/command-store";

import Command, {
    ArgumentTypeChecker,
    IArgument,
    TrivialArgType,
    ICustomArgType,
    IArgumentResolver,
    RestrictGroup,
    InternalArgType
} from "./commands/command";

import ConsoleInterface from "./console/console-interface";
import CommandParser from "./commands/command-parser";
import ConsoleCommand from "./console/console-command";
import BotBuilder from "./builders/bot-builder";
import EmbedBuilder from "./builders/embed-builder";
import ConfigBuilder from "./builders/config-builder";
import FormattedMessage from "./builders/formatted-message";
import EditableMessage from "./message/editable-message";
import Log, {LogLevel} from "./core/log";
import Rgb from "./misc/rgb";
import Rgba from "./misc/rgba";
import Settings from "./core/settings";
import TimeParser from "./time/time-parser";
import TimeSuffixType from "./time/time-suffix-type";
import Utils from "./core/utils";
import Permission from "./core/permission";
import ChatEnvironment from "./core/chat-environment";
import List from "./collections/collection";
import SetupHelper, {ISetupHelperResult} from "./core/setup-helper";
import Service, {IServiceOptions, ForkedService, GenericService, ProcessMsgType, IProcessMsg} from "./services/service";
import {on, WeakCommand, IDecoratorCommand, SimpleCommand, DiscordEvent} from "./decorators/decorators";
import {command} from "./decorators/decorators";
import Patterns from "./core/patterns";
import EmojiMenu, {IEmojiButton} from "./emoji-menu/emoji-menu";
import {IDisposable} from "./core/helpers";
import {ICommandExecutedEvent} from "./events/command-executed-event";
import {ICommandWillExecuteEvent} from "./events/command-will-execute-event";
import PaginatedMessage from "./pagination/paginated-message";
import Task from "./tasks/task";
import TaskManager from "./tasks/task-manager";
import {IAction, ActionType} from "./actions/action";
import ActionInterpreter, {IPaginatedActionArgs, IRequestActionArgs, IEmbedActionArgs, IPrivateMessageActionArgs, IMessageActionArgs} from "./actions/action-interpreter";
import {IFragment, IFragmentMeta} from "./fragments/fragment";
import SMIS from "./services/smis";
import {ISerializer} from "./serializers/serializer";
import LogSerializer, {ILogSource, ILogMsg} from "./serializers/log-serializer";
import StateSerializer from "./serializers/state-serializer";
import UrlSerializer from "./serializers/url-serializer";
import UserSerializer from "./serializers/user-serializer";
import {IProvider, PromiseOr, IDuplexProvider, IQueriableProvider} from "./providers/provider";
import {GuildConfig, GuildConfigMongoProvider} from "./providers/mongo-providers";
import Store, {TestStoreActionType, IStoreAction, TimeMachine, Reducer, ITestState} from "./state/store";

export {
    // Fragments
    IFragment,
    IFragmentMeta,

    // Commands
    ArgumentParser,
    CommandContext,
    CommandStore,
    CommandManagerEvent,
    CommandParser,
    IArgument,
    ICustomArgType,
    ArgumentTypeChecker as IArgumentTypeChecker,
    Command,
    TrivialArgType,
    IArgumentResolver,
    RestrictGroup,
    InternalArgType,

    // Console
    ConsoleInterface,
    ConsoleCommand,

    // Builder
    BotBuilder,
    EmbedBuilder,
    ConfigBuilder,
    FormattedMessage,

    // Core
    Bot,
    EditableMessage,
    Log,
    LogLevel,
    Rgb,
    Rgba,
    Settings,
    TimeParser,
    TimeSuffixType,
    Utils,
    Permission,
    ChatEnvironment,
    Patterns,
    DiscordEvent,

    // Collections
    List,

    // Emoji Menu
    IEmojiButton,
    EmojiMenu,

    // Events
    ICommandWillExecuteEvent,
    ICommandExecutedEvent,

    // Setup Helper
    SetupHelper,
    ISetupHelperResult,

    // Services
    Service,
    IServiceOptions,
    ForkedService,
    GenericService,

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
    TaskManager,

    // Actions
    IAction,
    ActionType,
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
    GuildConfigMongoProvider,

    // Store
    Store,
    TestStoreActionType as StoreActionType,
    IStoreAction,
    TimeMachine,
    Reducer,
    ITestState as IState
};