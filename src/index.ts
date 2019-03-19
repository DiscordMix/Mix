import ArgumentParser, {IArgumentParser} from "./commands/ArgumentParser";
import Context, {IContext, IContextOptions, TextBasedChannel} from "./commands/context";
import CommandRegistry, {ICommandRegistry} from "./commands/CommandRegistry";
import Bot from "./core/bot";

import Command, {
    GenericCommand,
    IArgument,
    ICustomArgType,
    IGenericCommand,
    RestrictGroup
} from "./commands/command";

import BotBuilder, {IBotBuilder} from "./Builders/botBuilder";
import {IBuilder} from "./Builders/Builder";
import ConfigBuilder, {IConfigBuilder} from "./Builders/ConfigBuilder";
import EmbedBuilder from "./Builders/EmbedBuilder";
import MsgBuilder, {IMsgBuilder} from "./Builders/MsgBuilder";
import CommandParser from "./commands/CommandParser";
import ConsoleCommand from "./console/consoleCommand";
import ConsoleInterface, {IConsoleInterface} from "./console/consoleInterface";
import {BotEvent, IBot} from "./core/botExtra";
import ChatEnv from "./core/ChatEnv";
import {IDisposable} from "./core/helpers";
import Log, {LogLevel} from "./core/log";
import Pattern from "./core/pattern";
import Permission from "./core/Permission";
import SetupHelper, {ISetupHelper, ISetupHelperResult} from "./core/SetupHelper";
import Util from "./core/Util";
import EmojiMenu, {IEmojiButton, IEmojiMenu} from "./EmojiMenu/EmojiMenu";
import {ICommandEvent} from "./Events/CommandEvent";
import {IFragment, IMeta} from "./fragments/fragment";
import Loader from "./fragments/Loader";
import EditableMessage from "./Message/EditableMessage";
import PaginatedMessage from "./Pagination/PaginatedMessage";
import LogSerializer, {ILogMsg, ILogSource} from "./Serializers/logSerializer";
import {ISerializer} from "./Serializers/Serializer";
import StateSerializer from "./Serializers/stateSerializer";
import UrlSerializer from "./Serializers/UrlSerializer";
import UserSerializer from "./Serializers/UserSerializer";
import {ForkedService} from "./services/forkedService";

import {
    GenericService,
    IForkedService,
    IGenericService,
    IProcessMsg,
    IService,
    IServiceOptions,
    ProcessMsgType
} from "./services/genericService";

import Service from "./services/service";
import SMIS from "./services/smis";
import Task, {ITask} from "./tasks/Task";
import TaskManager, {ITaskManager} from "./tasks/taskManager";
import TimeParser from "./time/timeParser";
import TimeSuffixType from "./time/timeSuffixType";
import List from "./Collections/List";
import DiscordEvent from "./core/DiscordEvent";
import {Constraint, constraints} from "./decorators/Constraint";
import {description, name, aliases, args, meta} from "./decorators/general";
import Component from "./decorators/Component";
import {DecoratorUtils} from "./decorators/DecoratorUtils";
import {guard, dependsOn, connect, attachedLoggerFn, notImplemented} from "./decorators/other";
import {Deprecated} from "./decorators/Utility";
import {PromiseOr} from "@atlas/xlib";
import {CmdHandlerEvent} from "./commands/commandHandler";
import {Once, On} from "./decorators/Events";
import BotConnector, {IBotConnector} from "./core/botConnector";
import {TypeChecker, Type, ArgumentResolver} from "./commands/type";
import ExclusiveConstraint from "./decorators/ExclusiveConstraint";

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
    name as Name,
    description as Description,
    aliases as Aliases,
    args as Args,
    Constraint,
    constraints,
    guard as Guard,
    On,
    Once,
    dependsOn as DependsOn,
    connect as Connect,
    attachedLoggerFn as AttachedLoggerFn,
    Component,
    DecoratorUtils,
    Deprecated,
    meta as Meta,
    ExclusiveConstraint,
    notImplemented as NotImplemented,

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
    UserSerializer
};
