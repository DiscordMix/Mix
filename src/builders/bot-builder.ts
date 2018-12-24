import Bot from "../core/bot";
import Settings from "../core/settings";

export default class BotBuilder {
    protected readonly settings: any;
    protected readonly bot: any;

    public constructor() {
        /**
         * @type {*}
         */
        this.settings = [];
    }

    /**
     * @param {string} token
     * @return {BotBuilder}
     */
    public setToken(token: string): BotBuilder {
        this.settings.general.token = token;

        return this;
    }

    /**
     * @param {string[]} prefixes
     * @return {BotBuilder}
     */
    public setPrefixes(prefixes: string[]): BotBuilder {
        this.settings.general.prefixes = prefixes;

        return this;
    }

    /**
     * @param {string[]} internalCommands
     * @return {BotBuilder}
     */
    public setInternalCommands(internalCommands: string[]): BotBuilder {
        this.bot.internalCommands = internalCommands;

        return this;
    }

    /**
     * @param {*} argumentTypes
     * @return {BotBuilder}
     */
    public setArgumentTypes(argumentTypes: any): BotBuilder {
        this.bot.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @param {boolean} prefixCommand
     * @return {BotBuilder}
     */
    public setPrefixCommand(prefixCommand: boolean): BotBuilder {
        this.bot.prefixCommand = prefixCommand;

        return this;
    }

    /**
     * @param {Settings} settings
     * @return {BotBuilder}
     */
    public setSettings(settings: Settings): BotBuilder {
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
