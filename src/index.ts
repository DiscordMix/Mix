import "babel-polyfill";
import ConsoleCommand from "./console/console-command";
import Bot from "./core/bot";
import EditableMessage from "./message/editable-message";
import EmbedBuilder from "./builders/embed-builder";
import Log, {LogLevel} from "./core/log";
import MessageBuilder from "./builders/message-builder";
import Rgb from "./misc/rgb";
import Rgba from "./misc/rgba";
import Settings from "./core/settings";
import TimeParser from "./time/time-parser";
import TimeSuffixType from "./time/time-suffix-type";
import Utils from "./core/utils";
import Permission from "./core/permission";
import ChatEnvironment from "./core/chat-environment";
import ConfigBuilder from "./builders/config-builder";
import CommandWillExecuteEvent from "./events/command-will-execute-event";
import Command from "./commands/command";
import ConsoleInterface from "./console/console-interface";

export default {
    // Commands
    CommandArgumentParser: require("./commands/command-argument-parser").default,
    CommandExecutionContext: require("./commands/command-execution-context").default,
    CommandLoader: require("./commands/command-loader").default,
    CommandManager: require("./commands/command-manager").default,
    CommandManagerEvent: require("./commands/command-manager").CommandManagerEvent,
    CommandParser: require("./commands/command-parser").default,
    Command: Command,
    CommandMetaOptions: require("./commands/command").CommandMetaOptions,
    CommandRestrictOptions: require("./commands/command").CommandRestrictOptions,
    CommandOptions: require("./commands/command").CommandOptions,

    // Console
    ConsoleInterface: ConsoleInterface,
    ConsoleCommand: ConsoleCommand,

    // Core
    Bot: Bot,
    EditableMessage: EditableMessage,
    EmbedBuilder: EmbedBuilder,
    Log: Log,
    LogLevel: LogLevel,
    MessageBuilder: MessageBuilder,
    Rgb: Rgb,
    Rgba: Rgba,
    Settings: Settings,
    TimeParser: TimeParser,
    TimeSuffixType: TimeSuffixType,
    Utils: Utils,
    Permission: Permission,
    ChatEnvironment: ChatEnvironment,
    ConfigBuilder: ConfigBuilder,

    // Plugins
    Plugin: require("./core/plugin").default,
    PluginManager: require("./core/plugin-manager").default,

    // Collections
    Collection: require("./collections/collection").default,
    EmojiCollection: require("./collections/emoji-collection").default,

    // Emoji UI
    EmojiButton: require("./emoji-ui/emoji-button").default,
    EmojiMenuManager: require("./emoji-ui/emoji-menu-manager").default,
    EmojiMenu: require("./emoji-ui/emoji-menu").default,

    // Events
    CommandWillExecuteEvent: CommandWillExecuteEvent,
    CommandExecutedEvent: require("./events/command-executed-event").default,

    // Data Stores
    DataStore: require("./data-stores/data-store").default,
    ObjectStore: require("./data-stores/object-store").default,
    JsonStore: require("./data-stores/json-store").default,
    SqliteStore: require("./data-stores/sqlite-store").default,
    MysqlStore: require("./data-stores/mysql-store").default,

    // Auth Stores
    CommandAuthStore: require("./commands/command-auth-store").default,
    ObjectAuthStore: require("./commands/object-auth-store").default,
    JsonAuthStore: require("./commands/json-auth-store").default
}
