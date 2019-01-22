import DiscordBot from "../bots/discord-bot";
import {IBot} from "../core/bot-extra";
import DiscordSettings from "../universal/discord/discord-settings";
import {IBuilder} from "./builder";

export interface IBotBuilder extends IBuilder<IBot> {
    token(token: string): this;
    prefixes(prefixes: string | string[]): this;
    internalCommands(internalCommands: string[]): this;
    argumentTypes(argumentTypes: any): this;
    prefixCommand(prefixCommand: boolean): this;
    settings(settings: DiscordSettings): this;
}

export default class BotBuilder implements IBotBuilder {
    protected readonly botSettings: any;
    protected readonly bot: any;

    public constructor() {
        /**
         * @type {*}
         */
        this.botSettings = [];
    }

    /**
     * @param {string} token
     * @return {BotBuilder}
     */
    public token(token: string): this {
        this.botSettings.general.token = token;

        return this;
    }

    /**
     * @param {string | string[]} prefixes
     * @return {BotBuilder}
     */
    public prefixes(prefixes: string | string[]): this {
        this.botSettings.general.prefixes = Array.isArray(prefixes) ? prefixes : [prefixes];

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
     * @param {DiscordSettings} settings
     * @return {BotBuilder}
     */
    public settings(settings: DiscordSettings): this {
        this.bot.settings = settings;

        return this;
    }

    /**
     * @return {DiscordBot}
     */
    public build(): IBot {
        // TODO:
        return new DiscordBot(this.bot);
    }
}
