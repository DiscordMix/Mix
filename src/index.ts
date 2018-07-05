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
import BotBuilder from "./builders/bot-builder";

export default {
    // Commands
    CommandArgumentParser: require("./commands/command-argument-parser").default,
    CommandExecutionContext: require("./commands/command-context").default,
    CommandLoader: require("./commands/command-loader").default,
    CommandManager: require("./commands/command-store").default,
    CommandManagerEvent: require("./commands/command-store").CommandManagerEvent,
    CommandParser: require("./commands/command-parser").default,
    Command: Command,
    CommandMetaOptions: require("./commands/command").CommandMetaOptions,
    CommandRestrictOptions: require("./commands/command").CommandRestrictOptions,
    CommandOptions: require("./commands/command").CommandOptions,

    // Console
    ConsoleInterface: ConsoleInterface,
    ConsoleCommand: ConsoleCommand,

    // Builder
    BotBuilder: BotBuilder,
    EmbedBuilder: EmbedBuilder,
    ConfigBuilder: ConfigBuilder,
    MessageBuilder: MessageBuilder,

    // Core
    Bot: Bot,
    EditableMessage: EditableMessage,
    Log: Log,
    LogLevel: LogLevel,
    Rgb: Rgb,
    Rgba: Rgba,
    Settings: Settings,
    TimeParser: TimeParser,
    TimeSuffixType: TimeSuffixType,
    Utils: Utils,
    Permission: Permission,
    ChatEnvironment: ChatEnvironment,

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
    DataStore: require("./data-providers/data-provider").default,
    ObjectStore: require("./data-providers/object-provider").default,
    JsonStore: require("./data-providers/json-provider").default,
    SqliteStore: require("./data-providers/sqlite-provider").default,
    MysqlStore: require("./data-providers/mysql-provider").default,

    // Auth Stores
    CommandAuthStore: require("./commands/auth-stores/command-auth-store").default,
    ObjectAuthStore: require("./commands/auth-stores/object-auth-store").default,
    JsonAuthStore: require("./commands/auth-stores/json-auth-store").default
}
