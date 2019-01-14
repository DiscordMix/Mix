import ArgumentParser, {IArgumentParser} from "./commands/argument-parser";
import Context, {IContext, IContextOptions, TextBasedChannel} from "./commands/command-context";
import CommandStore, {CommandManagerEvent, ICommandStore} from "./commands/command-store";
import Bot from "./core/bot";

import Command, {
    ArgumentTypeChecker,
    GenericCommand,
    IArgument,
    IArgumentResolver,
    ICustomArgType,
    IGenericCommand,
    InternalArgType,
    RestrictGroup,
    Type
} from "./commands/command";

import {ActionType, IAction} from "./actions/action";
import ActionInterpreter, {IActionInterpreter, IEmbedActionArgs, IMessageActionArgs, IPaginatedActionArgs, IPrivateMessageActionArgs, IRequestActionArgs} from "./actions/action-interpreter";
import BotBuilder, {IBotBuilder} from "./builders/bot-builder";
import {IBuilder} from "./builders/builder";
import ConfigBuilder, {IConfigBuilder} from "./builders/config-builder";
import EmbedBuilder from "./builders/embed-builder";
import MsgBuilder, {IMsgBuilder} from "./builders/msg-builder";
import CommandParser from "./commands/command-parser";
import ConsoleCommand from "./console/console-command";
import ConsoleInterface, {IConsoleInterface} from "./console/console-interface";
import {EBotEvents, IBot} from "./core/bot-extra";
import ChatEnv from "./core/chat-env";
import {IDisposable} from "./core/helpers";
import Log, {LogLevel} from "./core/log";
import Patterns from "./core/patterns";
import Permission from "./core/permission";
import Settings, {ISettings} from "./core/settings";
import SetupHelper, {ISetupHelper, ISetupHelperResult} from "./core/setup-helper";
import Utils from "./core/utils";
import EmojiMenu, {IEmojiButton, IEmojiMenu} from "./emoji-menu/emoji-menu";
import {ICommandEvent} from "./events/command-event";
import {IFragment, IFragmentMeta} from "./fragments/fragment";
import Loader from "./fragments/loader";
import EditableMessage from "./message/editable-message";
import Rgb from "./misc/rgb";
import Rgba from "./misc/rgba";
import PaginatedMessage from "./pagination/paginated-message";
import {GuildCfgMongoProvider, IGuildConfig} from "./providers/mongo-providers";
import {IDuplexProvider, IProvider, IQueriableProvider, PromiseOr} from "./providers/provider";
import LogSerializer, {ILogMsg, ILogSource} from "./serializers/log-serializer";
import {ISerializer} from "./serializers/serializer";
import StateSerializer from "./serializers/state-serializer";
import UrlSerializer from "./serializers/url-serializer";
import UserSerializer from "./serializers/user-serializer";
import {ForkedService} from "./services/forked-service";
import {GenericService, IForkedService, IGenericService, IProcessMsg, IService, IServiceOptions, ProcessMsgType} from "./services/generic-service";
import Service from "./services/service";
import SMIS from "./services/smis";
import Delta from "./state/delta";
import Store, {IStore, IStoreAction, ITestState, Reducer, TestStoreActionType} from "./state/store";
import {ITimeMachine, TimeMachine} from "./state/time-machine";
import Task, {ITask} from "./tasks/task";
import TaskManager, {ITaskManager} from "./tasks/task-manager";
import TimeParser from "./time/time-parser";
import TimeSuffixType from "./time/time-suffix-type";
import List from "./collections/list";
import DiscordEvent from "./core/discord-event";
import {Constraint} from "./decorators/constraints";
import {Description, Name} from "./decorators/general";
import Component from "./decorators/component";
import {DecoratorUtils} from "./decorators/decorator-utils";

export {
    // Fragments
    IFragment,
    IFragmentMeta,
    Loader,

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
    Type,
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
    ChatEnv,
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
    Name,
    Description,
    Constraint,
    Component,
    DecoratorUtils,

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
    IGuildConfig,
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
