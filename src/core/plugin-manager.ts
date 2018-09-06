import Bot from "./bot";

export default class PluginManager {
    private readonly bot: Bot;

    /**
     * @param {Bot} bot
     */
    constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;
    }

    /**
     * @param {string} name
     * @return {void}
     */
    public load(name: string): /* Plugin */ void {
        // TODO
    }
}
