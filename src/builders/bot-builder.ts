import Bot from "../core/bot";
import {IBot} from "../core/bot-extra";
import Settings from "../core/settings";
import {IBuilder} from "./builder";

export interface IBotBuilder extends IBuilder<IBot> {
    token(token: string): this;
    prefixes(prefixes: string | string[]): this;
    internalCommands(internalCommands: string[]): this;
    argumentTypes(argumentTypes: any): this;
    prefixCommand(prefixCommand: boolean): this;
    settings(settings: Settings): this;
}

export default class BotBuilder implements IBotBuilder {
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
    public token(token: string): this {
        this._settings.general.token = token;

        return this;
    }

    /**
     * @param {string | string[]} prefixes
     * @return {BotBuilder}
     */
    public prefixes(prefixes: string | string[]): this {
        this._settings.general.prefixes = Array.isArray(prefixes) ? prefixes : [prefixes];

        return this;
    }

    /**
     * @param {string[]} internalCommands
     * @return {BotBuilder}
     */
    public internalCommands(internalCommands: string[]): this {
        this.bot.internalCommands = internalCommands;

        return this;
    }

    /**
     * @param {*} argumentTypes
     * @return {BotBuilder}
     */
    public argumentTypes(argumentTypes: any): this {
        this.bot.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @param {boolean} prefixCommand
     * @return {BotBuilder}
     */
    public prefixCommand(prefixCommand: boolean): this {
        this.bot.prefixCommand = prefixCommand;

        return this;
    }

    /**
     * @param {Settings} settings
     * @return {BotBuilder}
     */
    public settings(settings: Settings): this {
        this.bot.settings = settings;

        return this;
    }

    /**
     * @return {Bot}
     */
    public build(): IBot {
        // TODO.
        return new Bot(this.bot);
    }
}
