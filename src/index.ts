import ArgumentParser, {IArgumentParser} from "./commands/argument-parser";
import Context, {IContext, IContextOptions, TextBasedChannel} from "./commands/context";
import CommandRegistry, {ICommandRegistry} from "./commands/command-registry";
import Bot from "./core/bot";
import {ActionType, IAction} from "./actions/action";

import Command, {
    GenericCommand,
    IArgument,
    ICustomArgType,
    IGenericCommand,
    RestrictGroup
} from "./commands/command";

import ActionInterpreter, {
    IActionInterpreter,
    IEmbedActionArgs,
    IMessageActionArgs,
    IPaginatedActionArgs,
    IPrivateMessageActionArgs,
    IRequestActionArgs
} from "./actions/action-interpreter";

import BotBuilder, {IBotBuilder} from "./builders/bot-builder";
import {IBuilder} from "./builders/builder";
import ConfigBuilder, {IConfigBuilder} from "./builders/config-builder";
import EmbedBuilder from "./builders/embed-builder";
import MsgBuilder, {IMsgBuilder} from "./builders/msg-builder";
import CommandParser from "./commands/command-parser";
import ConsoleCommand from "./console/console-command";
import ConsoleInterface, {IConsoleInterface} from "./console/console-interface";
import {BotEvent, IBot} from "./core/bot-extra";
import ChatEnv from "./core/chat-env";
import {IDisposable} from "./core/helpers";
import Log, {LogLevel} from "./core/log";
import Pattern from "./core/pattern";
import Permission from "./core/permission";
import SetupHelper, {ISetupHelper, ISetupHelperResult} from "./core/setup-helper";
import Util from "./core/util";
import EmojiMenu, {IEmojiButton, IEmojiMenu} from "./emoji-menu/emoji-menu";
import {ICommandEvent} from "./events/command-event";
import {IFragment, IMeta} from "./fragments/fragment";
import Loader from "./fragments/loader";
import EditableMessage from "./message/editable-message";
import Rgb from "./misc/rgb";
import Rgba from "./misc/rgba";
import PaginatedMessage from "./pagination/paginated-message";
import LogSerializer, {ILogMsg, ILogSource} from "./serializers/log-serializer";
import {ISerializer} from "./serializers/serializer";
import StateSerializer from "./serializers/state-serializer";
import UrlSerializer from "./serializers/url-serializer";
import UserSerializer from "./serializers/user-serializer";
import {ForkedService} from "./services/forked-service";

import {
    GenericService,
    IForkedService,
    IGenericService,
    IProcessMsg,
    IService,
    IServiceOptions,
    ProcessMsgType
} from "./services/generic-service";

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
import {Constraint, constraints} from "./decorators/constraint";
import {description, name, aliases, args, meta} from "./decorators/general";
import Component from "./decorators/component";
import {DecoratorUtils} from "./decorators/decorator-utils";
import {guard, dependsOn, connect, attachedLoggerFn} from "./decorators/other";
import {deprecated} from "./decorators/utility";
import {PromiseOr} from "@atlas/xlib";
import {CmdHandlerEvent} from "./commands/command-handler";
import {once, on} from "./decorators/events";
import BotConnector, {IBotConnector} from "./core/bot-connector";
import {TypeChecker, Type, ArgumentResolver} from "./commands/type";
import ExclusiveConstraint from "./decorators/exclusive-constraint";

export {
    // Fragments.
    IFragment,
    IMeta,
    Loader,

    // Commands.
    ArgumentParser,
    IArgumentParser,
    Context,
    IContext,
    TextBasedChannel,
    IContextOptions,
    CommandRegistry,
    ICommandRegistry,
    CmdHandlerEvent,
    CommandParser,
    IArgument,
    ICustomArgType,
    TypeChecker,
    Command,
    GenericCommand,
    IGenericCommand,
    Type,
    ArgumentResolver,
    RestrictGroup,

    // Console.
    ConsoleInterface,
    IConsoleInterface,
    ConsoleCommand,

    // Builder.
    BotBuilder,
    IBotBuilder,
    EmbedBuilder,
    ConfigBuilder,
    IConfigBuilder,
    MsgBuilder,
    IMsgBuilder,
    IBuilder,

    // Core.
    Bot,
    IBot,
    EditableMessage,
    Log,
    LogLevel,
    Rgb,
    Rgba,
    TimeParser,
    TimeSuffixType,
    Util,
    Permission,
    ChatEnv,
    Pattern,
    DiscordEvent,
    BotEvent,
    BotConnector,
    IBotConnector,

    // Collections.
    List,

    // Emoji Menu.
    IEmojiButton,
    EmojiMenu,
    IEmojiMenu,

    // Events.
    ICommandEvent,

    // Setup Helper.
    SetupHelper,
    ISetupHelper,
    ISetupHelperResult,

    // Services.
    Service,
    IService,
    IServiceOptions,
    ForkedService,
    IForkedService,
    GenericService,
    IGenericService,

    // Misc.
    PaginatedMessage,
    ProcessMsgType,
    IProcessMsg,
    SMIS,
    ILogMsg,
    ILogSource,
    PromiseOr,

    // Structures.
    IDisposable,

    // Decorators.
    name,
    description,
    aliases,
    args,
    Constraint,
    constraints,
    guard,
    on,
    once,
    dependsOn,
    connect,
    attachedLoggerFn,
    Component,
    DecoratorUtils,
    deprecated,
    meta,
    ExclusiveConstraint,

    // Tasks.
    Task,
    ITask,
    TaskManager,
    ITaskManager,

    // Actions.
    IAction,
    ActionType,
    IActionInterpreter,
    ActionInterpreter,
    IPaginatedActionArgs,
    IRequestActionArgs,
    IPrivateMessageActionArgs,
    IEmbedActionArgs,
    IMessageActionArgs,

    // Serializers.
    ISerializer,
    LogSerializer,
    StateSerializer,
    UrlSerializer,
    UserSerializer,

    // Store.
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
