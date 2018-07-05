import CommandAuthStore from "../commands/auth-stores/command-auth-store";
import Bot from "../core/bot";
import Settings from "../core/settings";

export default class BotBuilder {
    private readonly settings: any;
    private readonly bot: any;

    constructor() {
        /**
         * @type {*}
         */
        this.settings = [];
    }

    /**
     * @param {string} token
     * @returns {BotBuilder}
     */
    setToken(token: string): BotBuilder {
        this.settings.general.token = token;

        return this;
    }

    /**
     * @param {Array<string>} prefixes
     * @return {BotBuilder}
     */
    setPrefixes(prefixes: Array<string>): BotBuilder {
        this.settings.general.prefixes = prefixes;

        return this;
    }

    /**
     * @param {Array<string>} primitiveCommands
     * @return {BotBuilder}
     */
    setPrimitiveCommands(primitiveCommands: Array<string>): BotBuilder {
        this.bot.primitiveCommands = primitiveCommands;

        return this;
    }

    /**
     * @param {CommandAuthStore} authStore
     * @return {BotBuilder}
     */
    setAuthStore(authStore: CommandAuthStore): BotBuilder {
        this.bot.authStore = authStore;

        return this;
    }

    /**
     * @param {*} argumentTypes
     * @return {BotBuilder}
     */
    setArgumentTypes(argumentTypes: any): BotBuilder {
        this.bot.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @param {boolean} prefixCommand
     * @returns {BotBuilder}
     */
    setPrefixCommand(prefixCommand: boolean): BotBuilder {
        this.bot.prefixCommand = prefixCommand;

        return this;
    }

    /**
     * @param {Settings} settings
     * @return {BotBuilder}
     */
    setSettings(settings: Settings): BotBuilder {
        this.bot.settings = settings;

        return this;
    }

    /**
     * @return {Bot}
     */
    build(): Bot {
        // TODO
        return new Bot(this.bot);
    }
}
