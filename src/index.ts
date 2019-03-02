import ArgumentParser, {IArgumentParser} from "./commands/ArgumentParser";
import Context, {IContext, IContextOptions, TextBasedChannel} from "./commands/Context";
import CommandRegistry, {ICommandRegistry} from "./commands/CommandRegistry";
import Bot from "./core/Bot";

import Command, {
    GenericCommand,
    IArgument,
    ICustomArgType,
    IGenericCommand,
    RestrictGroup
} from "./commands/Command";

import BotBuilder, {IBotBuilder} from "./builders/BotBuilder";
import {IBuilder} from "./builders/Builder";
import ConfigBuilder, {IConfigBuilder} from "./builders/ConfigBuilder";
import EmbedBuilder from "./builders/EmbedBuilder";
import MsgBuilder, {IMsgBuilder} from "./builders/MsgBuilder";
import CommandParser from "./commands/CommandParser";
import ConsoleCommand from "./console/ConsoleCommand";
import ConsoleInterface, {IConsoleInterface} from "./console/ConsoleInterface";
import {BotEvent, IBot} from "./core/BotExtra";
import ChatEnv from "./core/ChatEnv";
import {IDisposable} from "./core/Helpers";
import Log, {LogLevel} from "./core/Log";
import Pattern from "./core/Pattern";
import Permission from "./core/Permission";
import SetupHelper, {ISetupHelper, ISetupHelperResult} from "./core/SetupHelper";
import Util from "./core/Util";
import EmojiMenu, {IEmojiButton, IEmojiMenu} from "./EmojiMenu/EmojiMenu";
import {ICommandEvent} from "./Events/CommandEvent";
import {IFragment, IMeta} from "./Fragments/Fragment";
import Loader from "./Fragments/Loader";
import EditableMessage from "./Message/EditableMessage";
import Rgb from "./Misc/RGB";
import Rgba from "./Misc/RGBA";
import PaginatedMessage from "./Pagination/PaginatedMessage";
import LogSerializer, {ILogMsg, ILogSource} from "./Serializers/LogSerializer";
import {ISerializer} from "./Serializers/Serializer";
import StateSerializer from "./Serializers/StateSerializer";
import UrlSerializer from "./Serializers/UrlSerializer";
import UserSerializer from "./Serializers/UserSerializer";
import {ForkedService} from "./Services/ForkedService";

import {
    GenericService,
    IForkedService,
    IGenericService,
    IProcessMsg,
    IService,
    IServiceOptions,
    ProcessMsgType
} from "./Services/GenericService";

import Service from "./Services/Service";
import SMIS from "./Services/SMIS";
import Delta from "./State/Delta";
import Store, {IStore, IStoreAction, ITestState, Reducer, TestStoreActionType} from "./State/Store";
import {ITimeMachine, TimeMachine} from "./State/TimeMachine";
import Task, {ITask} from "./Tasks/Task";
import TaskManager, {ITaskManager} from "./Tasks/TaskManager";
import TimeParser from "./Time/Parser";
import TimeSuffixType from "./Time/SuffixType";
import List from "./collections/List";
import DiscordEvent from "./core/DiscordEvent";
import {Constraint, constraints} from "./Decorators/Constraint";
import {description, name, aliases, args, meta} from "./Decorators/General";
import Component from "./Decorators/Component";
import {DecoratorUtils} from "./Decorators/DecoratorUtils";
import {guard, dependsOn, connect, attachedLoggerFn, notImplemented} from "./Decorators/Other";
import {deprecated} from "./Decorators/Utility";
import {PromiseOr} from "@atlas/xlib";
import {CmdHandlerEvent} from "./commands/CommandHandler";
import {once, on} from "./Decorators/Events";
import BotConnector, {IBotConnector} from "./core/BotConnector";
import {TypeChecker, Type, ArgumentResolver} from "./commands/Type";
import ExclusiveConstraint from "./Decorators/ExclusiveConstraint";

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
    notImplemented,

    // Tasks.
    Task,
    ITask,
    TaskManager,
    ITaskManager,

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
