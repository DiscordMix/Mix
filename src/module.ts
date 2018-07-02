import Bot from "./core/bot";
import CommandArgumentParser from "./commands/command-argument-parser";
import CommandExecutionContext from "./commands/command-execution-context";
import CommandLoader from "./commands/command-loader";
import CommandManager, {CommandManagerEvent} from "./commands/command-manager";
import Command, {CommandMetaOptions, CommandRestrictOptions, CommandOptions} from "./commands/command";
import ConsoleInterface from "./console/console-interface";
import CommandParser from "./commands/command-parser";
import ConsoleCommand from "./console/console-command";
import BotBuilder from "./builders/bot-builder";
import EmbedBuilder from "./builders/embed-builder";
import ConfigBuilder from "./builders/config-builder";
import MessageBuilder from "./builders/message-builder";
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
import DataStore from "./data-stores/data-store";
import ObjectStore from "./data-stores/object-store";
import JsonStore from "./data-stores/json-store";
import SqliteStore from "./data-stores/sqlite-store";
import MysqlStore from "./data-stores/mysql-store";
import CommandAuthStore from "./commands/command-auth-store";
import ObjectAuthStore from "./commands/auth-stores/object-auth-store";
import JsonAuthStore from "./commands/auth-stores/json-auth-store";

export {
    // Commands
    CommandArgumentParser,
    CommandExecutionContext,
    CommandLoader,
    CommandManager,
    CommandManagerEvent,
    CommandParser,
    Command,
    CommandMetaOptions,
    CommandRestrictOptions,
    CommandOptions,

    // Console
    ConsoleInterface,
    ConsoleCommand,

    // Builder
    BotBuilder,
    EmbedBuilder,
    ConfigBuilder,
    MessageBuilder,

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

    // Plugins
    Plugin, // Why error?
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
    DataStore,
    ObjectStore,
    JsonStore,
    SqliteStore,
    MysqlStore,

    // Auth Stores
    CommandAuthStore,
    ObjectAuthStore,
    JsonAuthStore
};
