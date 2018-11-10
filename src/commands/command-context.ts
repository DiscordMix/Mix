import {Message, TextChannel, User} from "discord.js";
import Bot from "../core/bot";
import ResponseHelper from "../core/response-helper";
import Utils from "../core/utils";

export type ICommandExecutionContextOptions = {
    readonly message: Message;
    readonly bot: Bot;
    readonly label: string | null;
}

export default class CommandContext<DataType = any> extends ResponseHelper {
    public readonly bot: Bot;
    public readonly message: Message;
    public readonly label: string | null;

    public data?: DataType;

    /**
     * @param {ICommandExecutionContextOptions} options
     */
    public constructor(options: ICommandExecutionContextOptions) {
        if (options.message.channel.type !== "text") {
            throw new Error("[CommandContext] Expecting message's channel to be a text channel");
        }

        super(options.message.channel as TextChannel, options.bot, options.message.author);

        /**
         * @type {Message}
         * @readonly
         */
        this.message = options.message;

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {string}
         * @readonly
         */
        this.label = options.label;
    }

    /**
     * Join all command arguments into a single string
     * @return {string}
     */
    public joinArguments(): string {
        if (!this.label) {
            return this.message.content;
        }

        return this.message.content.substr(this.label.length + 1);
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Message[] | null>}
     */
    public async reply(message: string): Promise<Message | Message[] | null> {
        return await this.message.reply(Utils.escapeText(message, this.bot.client.token));
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Message>}
     */
    public async privateReply(message: string): Promise<Message | Message[]> {
        return await this.message.author.send(Utils.escapeText(message, this.bot.client.token));
    }
}
