import Bot from "./core/bot";
import ArgumentParser from "./commands/argument-parser";
import CommandContext from "./commands/command-context";
import CommandStore, {CommandManagerEvent} from "./commands/command-store";

import Command, {
    IArgumentTypeChecker,
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
import Collection from "./collections/collection";
import DataProvider from "./data-providers/data-provider";
import ObjectProvider from "./data-providers/object-provider";
import JsonProvider from "./data-providers/json-provider";
import SqliteProvider from "./data-providers/sqlite-provider";
import MysqlProvider from "./data-providers/mysql-provider";
import SetupHelper, {ISetupHelperResult} from "./core/setup-helper";
import Service, {IServiceOptions} from "./services/service";
import KnexTable from "./data-providers/knex-table";
import {on, WeakCommand, IDecoratorCommand, SimpleCommand, DiscordEvent} from "./decorators/decorators";
import {command} from "./decorators/decorators";
import Patterns from "./core/patterns";
import EmojiMenu, {IEmojiButton} from "./emoji-menu/emoji-menu";
import PaginatedMessage from "./pagination/paginated-message";
import {IDisposable} from "./core/structures";
import {ICommandExecutedEvent} from "./events/command-executed-event";
import {ICommandWillExecuteEvent} from "./events/command-will-execute-event";
import {Task} from "./tasks/task";
import TaskManager from "./tasks/task-manager";

export {
    // Commands
    ArgumentParser,
    CommandContext,
    CommandStore,
    CommandManagerEvent,
    CommandParser,
    IArgument,
    ICustomArgType,
    IArgumentTypeChecker,
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
    Collection,

    // Emoji Menu
    IEmojiButton,
    EmojiMenu,

    // Events
    ICommandWillExecuteEvent,
    ICommandExecutedEvent,

    // Data Stores
    DataProvider,
    ObjectProvider,
    JsonProvider,
    SqliteProvider,
    MysqlProvider,

    // Setup Helper
    SetupHelper,
    ISetupHelperResult,

    // Services
    Service,
    IServiceOptions,

    // Misc
    KnexTable,
    PaginatedMessage,

    // Snap
    IDisposable,

    // Decorators
    on,
    command,
    WeakCommand,
    IDecoratorCommand,
    SimpleCommand,

    // Tasks
    Task,
    TaskManager
};
