import EditableMessage from "../message/editable-message";
import EmbedBuilder from "../builders/embed-builder";
import Discord, {Message, Role, Snowflake, User, RichEmbed} from "discord.js";
import Bot from "../core/bot";
import EmojiCollection from "../collections/emoji-collection";
import FormattedMessage from "../builders/formatted-message";
import Log from "../core/log";
import {Utils} from "..";

export type CommandExecutionContextOptions = {
    readonly message: Message;
    readonly bot: Bot;
    readonly emojis?: EmojiCollection;
    readonly label: string | null;
}

export default class CommandContext<DataType = any> {
    public readonly message: Message;
    public readonly bot: Bot;
    public readonly emojis?: EmojiCollection;
    public readonly label: string | null;

    public data?: DataType;

    /**
     * @param {CommandExecutionContextOptions} options
     */
    constructor(options: CommandExecutionContextOptions) {
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
         * @type {EmojiCollection}
         * @readonly
         */
        this.emojis = options.emojis;

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
     * @param {*} stream
     * @param {string} name
     * @return {Promise<EditableMessage> | null}
     */
    public async fileStream(stream: any, name: string): Promise<EditableMessage> {
        return new EditableMessage(await this.message.channel.send(new Discord.Attachment(stream, name)));
    }

    /**
     * @todo Content parameter type
     * @param {EmbedBuilder | *} content
     * @param {boolean} [autoDelete=false]
     * @return {Promise<EditableMessage> | null}
     */
    public async respond(content: EmbedBuilder | any, autoDelete: boolean = false): Promise<EditableMessage | null> {
        let embed: EmbedBuilder | null = null;
        let finalContent: EmbedBuilder | any = Object.assign({}, content);

        if (typeof (finalContent as any).text === "string") {
            if (finalContent.text.trim() === "" || finalContent.text === undefined || finalContent.text === null) {
                finalContent.text = ":thinking: *Empty response*";
            }
            else if (finalContent.text.length > 2048) {
                if (finalContent.text.endsWith("```")) {
                    finalContent.text = finalContent.text.substring(0, 2045) + "```";
                }

                // TODO: ... not being added at the end
                finalContent.text = finalContent.text.substring(0, 2044) + " ...";

                Log.warn("[Context.respond] Attempted to send a message with more than 2048 characters (Discord limit); The message was automatically trimmed");
            }

            finalContent.text = Utils.escapeText(finalContent.text, this.bot.client.token);
        }

        if (finalContent instanceof EmbedBuilder) {
            embed = finalContent;
        }
        else {
            if (!finalContent.color) {
                finalContent.color = "GREEN";
            }

            if (!finalContent.footer) {
                finalContent.footer = {
                    text: `Requested by ${this.sender.username}`,
                    icon: this.sender.avatarURL
                };
            }

            embed = EmbedBuilder.fromObject(finalContent);
        }

        let messageResult = await this.message.channel.send(embed.build()).catch((error: Error) => {
            // TODO: Temporarily disabled due to spamming on unwanted servers.
            // this.privateReply(`Oh no! For some reason, I was unable to reply to you in that channel. (${error.message})`);
        });

        // TODO: Hotfix
        if (Array.isArray(messageResult)) {
            messageResult = messageResult[0];
        }

        if (autoDelete && messageResult) {
            const buildEmbed: RichEmbed = embed.build();
            const fields: any = buildEmbed.fields;

            let contentSize: number = 0;

            if (fields) {
                for (let i = 0; i < fields.length; i++) {
                    contentSize += fields[i].name.length + fields[i].value.length;
                }
            }

            if (buildEmbed.description) {
                contentSize += buildEmbed.description.length;
            }

            const timeToLive: number = 4000 + (100 * contentSize);

            // Time depends on length
            messageResult.delete(timeToLive);
        }

        return (messageResult !== undefined ? new EditableMessage(messageResult) : null);
    }

    /**
     * @todo For some reason not having 'Requested by' footer
     * @param {*} sections
     * @param {string} color
     * @return {Promise<EditableMessage>}
     */
    public async sections(sections: any, color: string = "GREEN"): Promise<EditableMessage | null> {
        return await this.respond(EmbedBuilder.sections(sections, color));
    }

    /**
     * @param {string} text
     * @param {string} [title=""]
     * @param {boolean} [clean=true] Whether to filter the message
     * @return {Promise<EditableMessage>}
     */
    public async ok(text: string | FormattedMessage, title: string = "", clean: boolean = true): Promise<EditableMessage | null> {
        return await this.respond({
            text: typeof text === "string" ? `${this.bot.options.emojis.success} ${text}` : text.build(),
            title: title
        });
    }

    /**
     * @param {string} text
     * @return {Promise<EditableMessage>}
     */
    public async send(text: string | RichEmbed | Message): Promise<EditableMessage | null> {
        return new EditableMessage(await this.message.channel.send(text));
    }

    /**
     * @param {string} text
     * @return {Promise<EditableMessage>}
     */
    public async loading(text: string): Promise<EditableMessage | null> {
        return await this.respond({
            // TODO: Isn't the emoji missing?
            text: text,
            color: "BLUE"
        });
    }

    /**
     * @param {string} text
     * @param {boolean} [autoDelete=true]
     * @return {Promise<EditableMessage | null>}
     */
    public async fail(text: string, autoDelete: boolean = true): Promise<EditableMessage | null> {
        return await this.respond({
            text: `${this.bot.options.emojis.error} ${text}`,
            color: "RED",

            // TODO: Returns static image, and won't change to random
            //thumbnail: "https://cataas.com/cat"
        }, autoDelete);
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

    /**
     * @return {User}
     */
    public get sender(): User {
        return this.message.author;
    }
}