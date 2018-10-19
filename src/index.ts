import Bot from "./core/bot";
import ArgumentParser from "./commands/argument-parser";
import CommandContext from "./commands/command-context";
import CommandStore, {CommandManagerEvent} from "./commands/command-store";

import Command, {
    IArgumentTypeChecker,
    Argument,
    PrimitiveArgType,
    ICustomArgType,
    ArgumentResolver,
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
import PluginManager from "./core/plugin-manager";
import Collection from "./collections/collection";
import EmojiCollection from "./collections/emoji-collection";
import EmojiButton from "./emoji-ui/emoji-button";
import EmojiMenuManager from "./emoji-ui/emoji-menu-manager";
import EmojiMenu from "./emoji-ui/emoji-menu";
import CommandWillExecuteEvent from "./events/command-will-execute-event";
import CommandExecutedEvent from "./events/command-executed-event";
import DataProvider from "./data-providers/data-provider";
import ObjectProvider from "./data-providers/object-provider";
import JsonProvider from "./data-providers/json-provider";
import SqliteProvider from "./data-providers/sqlite-provider";
import MysqlProvider from "./data-providers/mysql-provider";
import CommandAuthStore from "./commands/auth-stores/command-auth-store";
import ObjectAuthStore from "./commands/auth-stores/object-auth-store";
import JsonAuthStore from "./commands/auth-stores/json-auth-store";
import SetupHelper, {SetupHelperResult} from "./core/setup-helper";
import Service, {IServiceOptions} from "./services/service";
import KnexTable from "./data-providers/knex-table";
import {on, WeakCommand, DecoratorCommand, SimpleCommand, DiscordEvent} from "./decorators/decorators";
import {command} from "./decorators/decorators";
import Patterns from "./core/patterns";
import EmojiMenuV2, {IEmojiButtonV2} from "./emoj-menu-v2/emoji-menu-v2";
import Pagination from "./pagination/pagination";
import {IDetachable} from "./core/snap";

export {
    // Commands
    ArgumentParser,
    CommandContext,
    CommandStore,
    CommandManagerEvent,
    CommandParser,
    Argument,
    ICustomArgType,
    IArgumentTypeChecker,
    Command,
    PrimitiveArgType,
    ArgumentResolver,
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

    // Plugins
    // Plugin, // Why error?
    PluginManager,

    // Collections
    Collection,
    EmojiCollection,

    // Emoji UI
    EmojiButton,
    EmojiMenuManager,
    EmojiMenu,

    // Events
    CommandWillExecuteEvent,
    CommandExecutedEvent,

    // Data Stores
    DataProvider,
    ObjectProvider,
    JsonProvider,
    SqliteProvider,
    MysqlProvider,

    // Auth Stores
    CommandAuthStore,
    ObjectAuthStore,
    JsonAuthStore,

    // Setup Helper
    SetupHelper,
    SetupHelperResult,

    // Services
    Service,
    IServiceOptions,

    // Misc
    KnexTable,
    EmojiMenuV2,
    IEmojiButtonV2,
    Pagination,

    // Snap
    IDetachable,

    // Decorators
    on,
    command,
    WeakCommand,
    DecoratorCommand,
    SimpleCommand
};
