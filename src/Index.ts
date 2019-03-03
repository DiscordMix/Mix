import ArgumentParser, {IArgumentParser} from "./Commands/ArgumentParser";
import Context, {IContext, IContextOptions, TextBasedChannel} from "./Commands/Context";
import CommandRegistry, {ICommandRegistry} from "./Commands/CommandRegistry";
import Bot from "./Core/Bot";

import Command, {
    GenericCommand,
    IArgument,
    ICustomArgType,
    IGenericCommand,
    RestrictGroup
} from "./Commands/Command";

import BotBuilder, {IBotBuilder} from "./Builders/BotBuilder";
import {IBuilder} from "./Builders/Builder";
import ConfigBuilder, {IConfigBuilder} from "./Builders/ConfigBuilder";
import EmbedBuilder from "./Builders/EmbedBuilder";
import MsgBuilder, {IMsgBuilder} from "./Builders/MsgBuilder";
import CommandParser from "./Commands/CommandParser";
import ConsoleCommand from "./Console/ConsoleCommand";
import ConsoleInterface, {IConsoleInterface} from "./Console/ConsoleInterface";
import {BotEvent, IBot} from "./Core/BotExtra";
import ChatEnv from "./Core/ChatEnv";
import {IDisposable} from "./Core/Helpers";
import Log, {LogLevel} from "./Core/Log";
import Pattern from "./Core/Pattern";
import Permission from "./Core/Permission";
import SetupHelper, {ISetupHelper, ISetupHelperResult} from "./Core/SetupHelper";
import Util from "./Core/Util";
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
import TimeParser from "./Time/TimeParser";
import TimeSuffixType from "./Time/TimeSuffixType";
import List from "./Collections/List";
import DiscordEvent from "./Core/DiscordEvent";
import {Constraint, constraints} from "./Decorators/Constraint";
import {Description, Name, Aliases, Args, Meta} from "./Decorators/General";
import Component from "./Decorators/Component";
import {DecoratorUtils} from "./Decorators/DecoratorUtils";
import {Guard, DependsOn, Connect, AttachedLoggerFn, NotImplemented} from "./Decorators/Other";
import {Deprecated} from "./Decorators/Utility";
import {PromiseOr} from "@atlas/xlib";
import {CmdHandlerEvent} from "./Commands/CommandHandler";
import {Once, On} from "./Decorators/Events";
import BotConnector, {IBotConnector} from "./Core/BotConnector";
import {TypeChecker, Type, ArgumentResolver} from "./Commands/Type";
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
    Name,
    Description,
    Aliases,
    Args,
    Constraint,
    constraints,
    Guard,
    On,
    Once,
    DependsOn,
    Connect,
    AttachedLoggerFn,
    Component,
    DecoratorUtils,
    Deprecated,
    Meta,
    ExclusiveConstraint,
    NotImplemented,

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
