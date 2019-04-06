import Context, {IContext, IContextOptions, TextBasedChannel} from "./commands/context";
import Bot from "./core/bot";

import Command, {
    GenericCommand,
    IArgument,
    ICustomArgType,
    IGenericCommand,
    RestrictGroup,
    IRunnable,
    Runnable
} from "./commands/command";

import ConsoleCommand from "./console/consoleCommand";
import ConsoleInterface, {IConsoleInterface} from "./console/consoleInterface";
import {BotEvent, IBot} from "./core/botExtra";
import {IDisposable} from "./util/helpers";
import Log, {LogLevel} from "./core/log";
import Pattern from "./core/pattern";
import EmojiMenu, {IEmojiButton, IEmojiMenu} from "./core/emojiMenu";
import {ICommandEvent} from "./core/commandEvent";
import {IFragment, IMeta} from "./fragments/fragment";
import EditableMessage from "./core/editableMessage";
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
import TaskManager, {ITaskManager} from "./tasks/taskManager";
import {desc, name, aliases, args, meta} from "./decorators/general";
import {guard, dependsOn, connect, attachedLoggerFn, notImplemented} from "./decorators/other";
import {PromiseOr, List} from "@atlas/xlib";
import {CmdHandlerEvent} from "./commands/commandHandler";
import BotConnector, {IBotConnector} from "./core/botConnector";
import {TypeChecker, type, ArgumentResolver} from "./commands/type";
import Loader from "./fragments/loader";
import CommandParser from "./commands/commandParser";
import EmbedBuilder from "./builders/embedBuilder";
import MsgBuilder, {IMsgBuilder} from "./builders/msgBuilder";
import TimeParser from "./time/timeParser";
import TimeSuffixType from "./time/timeSuffixType";
import Permission from "./core/permission";
import ChatEnv from "./core/chatEnv";
import DiscordEvent from "./core/discordEvent";
import SetupHelper, {ISetupHelper, ISetupHelperResult} from "./util/setupHelper";
import PaginatedMessage from "./core/paginatedMessage";
import LogSerializer, {ILogMsg, ILogSource} from "./serializers/logSerializer";
import {Constraint, constraints} from "./decorators/constraint";
import Component from "./decorators/component";
import {DecoratorUtils} from "./decorators/decoratorUtils";
import ExclusiveConstraint from "./decorators/exclusiveConstraint";
import Task, {ITask} from "./tasks/task";
import {ISerializer} from "./serializers/serializer";
import StateSerializer from "./serializers/stateSerializer";
import UrlSerializer from "./serializers/urlSerializer";
import UserSerializer from "./serializers/userSerializer";
import ArgumentParser, {IArgumentParser} from "./commands/argumentParser";
import CommandRegistry, {ICommandRegistry} from "./commands/commandRegistry";
import {on, once} from "./decorators/events";
import {deprecated} from "./decorators/utility";
import Util from "./util/util";
import {BCodeAction} from "./bCode/bCodeAction";
import BCodeRegistry, {IBCodeRegistry} from "./bCode/bCodeRegistry";
import {IBCodeContext} from "./bCode/bCodeContext";
import BCodeParser, {IBCodeMatch, IBCodeDelimiters} from "./bCode/bCodeParser";

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
    type,
    ArgumentResolver,
    RestrictGroup,
    Runnable,
    IRunnable,

    // Console.
    ConsoleInterface,
    IConsoleInterface,
    ConsoleCommand,

    // Builder.
    EmbedBuilder,
    MsgBuilder,
    IMsgBuilder,

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
    name,
    desc,
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

    // BCodes.
    IBCodeContext,
    IBCodeRegistry,
    BCodeRegistry,
    BCodeAction,
    BCodeParser,
    IBCodeMatch,
    IBCodeDelimiters
};
