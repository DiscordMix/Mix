import Bot from "./bot";

export default class PluginManager {
    private readonly bot: Bot;

    constructor(bot: Bot) {
        this.bot = bot;
    }

    load(name: string): Plugin {

    }
}
