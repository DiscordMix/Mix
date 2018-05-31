import Settings from "./settings";
import EmojiCollection from "../collections/emoji-collection";

export default interface BotOptions {
    settings: Settings;
    dataStore: DataStore;
    authStore: CommandAuthStore;
    emojis: EmojiCollection;
    client: any; // TODO
    commands: CommandManager;
    features: FeatureManager;
    commandLoader: CommandLoader;
    console: ConsoleInterface;
    menus: EmojiMenuManager;
}
