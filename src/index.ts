import "babel-polyfill";

module.exports = {
    // Commands
    CommandArgumentParser: require("./commands/command-argument-parser").default,
    CommandExecutionContext: require("./commands/command-execution-context").default,
    CommandLoader: require("./commands/command-loader").default,
    CommandManager: require("./commands/command-manager").default,
    CommandManagerEvent: require("./commands/command-manager").CommandManagerEvent,
    CommandParser: require("./commands/command-parser").default,
    Command: require("./commands/command").default,
    CommandMetaOptions: require("./commands/command").CommandMetaOptions,
    CommandRestrictOptions: require("./commands/command").CommandRestrictOptions,
    CommandOptions: require("./commands/command").CommandOptions,

    // Console
    ConsoleInterface: require("./console/console-interface").default,
    ConsoleCommand: require("./console/console-command").default,

    // Core
    Bot: require("./core/bot").default,
    EditableMessage: require("./message/editable-message").default,
    EmbedBuilder: require("./builders/embed-builder").default,
    Log: require("./core/log").default,
    LogLevel: require("./core/log").LogLevel,
    MessageBuilder: require("./builders/message-builder").default,
    Rgb: require("./misc/rgb").default,
    Rgba: require("./misc/rgba").default,
    Settings: require("./core/settings").default,
    TimeParser: require("./time/time-parser").default,
    TimeSuffixType: require("./time/time-suffix-type").default,
    Utils: require("./core/utils").default,
    Permission: require("./core/permission").default,
    ChatEnvironment: require("./core/chat-environment").default,
    ConfigBuilder: require("./builders/config-builder").default,

    // Collections
    Collection: require("./collections/collection").default,
    EmojiCollection: require("./collections/emoji-collection").default,

    // Emoji UI
    EmojiButton: require("./emoji-ui/emoji-button").default,
    EmojiMenuManager: require("./emoji-ui/emoji-menu-manager").default,
    EmojiMenu: require("./emoji-ui/emoji-menu").default,

    // Events
    CommandWillExecuteEvent: require("./events/command-will-execute-event").default,
    CommandExecutedEvent: require("./events/command-executed-event").default,

    // Features
    FeatureManager: require("./features/feature-manager").default,
    Feature: require("./features/feature").default,

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
};