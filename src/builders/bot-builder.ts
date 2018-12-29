import Bot from "../core/bot";
import Settings from "../core/settings";

export default class BotBuilder {
    protected readonly _settings: any;
    protected readonly bot: any;

    public constructor() {
        /**
         * @type {*}
         */
        this._settings = [];
    }

    /**
     * @param {string} token
     * @return {BotBuilder}
     */
    public token(token: string): BotBuilder {
        this._settings.general.token = token;

        return this;
    }

    /**
     * @param {string | string[]} prefixes
     * @return {BotBuilder}
     */
    public prefixes(prefixes: string | string[]): BotBuilder {
        this._settings.general.prefixes = Array.isArray(prefixes) ? prefixes : [prefixes];

        return this;
    }

    /**
     * @param {string[]} internalCommands
     * @return {BotBuilder}
     */
    public internalCommands(internalCommands: string[]): BotBuilder {
        this.bot.internalCommands = internalCommands;

        return this;
    }

    /**
     * @param {*} argumentTypes
     * @return {BotBuilder}
     */
    public argumentTypes(argumentTypes: any): BotBuilder {
        this.bot.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @param {boolean} prefixCommand
     * @return {BotBuilder}
     */
    public prefixCommand(prefixCommand: boolean): BotBuilder {
        this.bot.prefixCommand = prefixCommand;

        return this;
    }

    /**
     * @param {Settings} settings
     * @return {BotBuilder}
     */
    public settings(settings: Settings): BotBuilder {
        this.bot.settings = settings;

        return this;
    }

    /**
     * @return {Bot}
     */
    public build(): Bot {
        // TODO:
        return new Bot(this.bot);
    }
}
