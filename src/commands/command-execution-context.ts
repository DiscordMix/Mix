import EditableMessage from "../message/editable-message";
import EmbedBuilder from "../builders/embed-builder";
import {Message, Role, Snowflake, User} from "discord.js";
import Bot from "../core/bot";
import EmojiCollection from "../collections/emoji-collection";

const Discord = require("discord.js");

export interface CommandExecutionContextOptions {
    readonly message: Message;
    readonly args: Array<string>;
    readonly bot: Bot;
    readonly auth: number;
    readonly emojis?: EmojiCollection;
    readonly label: string | null;
}

export default class CommandExecutionContext {
    readonly message: Message;
    readonly arguments: Array<string>;
    readonly bot: Bot;
    readonly auth: number;
    readonly emojis?: EmojiCollection;
    readonly label: string | null;

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
         * @type {Array<string>}
         * @readonly
         */
        this.arguments = options.args;

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {number}
         * @readonly
         */
        this.auth = options.auth;

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
     * @param {Snowflake} userId
     * @return {number}
     */
    getAuth(userId: Snowflake): number {
        return this.bot.authStore.getAuthority(this.message.guild.id, userId, this.message.guild.member(userId).roles.array().map((role: Role) => role.name));
    }

    /**
     * Join all command arguments into a single string
     * @return {string}
     */
    joinArguments(): string {
        if (!this.label) {
            return this.message.content;
        }

        return this.message.content.substr(this.label.length + 1);
    }

    /**
     * @param {*} stream
     * @param {string} name
     * @return {Promise<EditableMessage>|null}
     */
    async fileStream(stream: any, name: string): Promise<EditableMessage> {
        return new EditableMessage(await this.message.channel.send(new Discord.Attachment(stream, name)));
    }

    /**
     * @param {Object|EmbedBuilder} content
     * @param {boolean} [autoDelete=false]
     * @return {Promise<EditableMessage>|null}
     */
    async respond(content: any | EmbedBuilder, autoDelete: boolean = false): Promise<EditableMessage | null> {
        let embed = null;

        if (content.text) {
            if (content.text.toString().trim() === "" || content.text === undefined || content.text === null) {
                content.text = ":thinking: *Empty response.*";
            }
        }

        if (content instanceof EmbedBuilder) {
            embed = content;
        }
        else {
            if (!content.color) {
                content.color = "GREEN";
            }

            if (!content.footer) {
                content.footer = {
                    text: `Requested by ${this.sender.username}`,
                    icon: this.sender.avatarURL
                };
            }

            embed = EmbedBuilder.fromObject(content);
        }

        let messageResult = await this.message.channel.send(embed.build()).catch((error: Error) => {
            // TODO: Temporarily disabled due to spamming on unwanted servers.
            // this.privateReply(`Oh noes! For some reason, I was unable to reply to you in that channel. (${error.message})`);
        });

        // TODO: Hotfix
        if (Array.isArray(messageResult)) {
            messageResult = messageResult[0];
        }

        if (autoDelete && messageResult) {
            const fields = embed.build().fields;

            let contentSize = 0;

            if (fields) {
                for (let i = 0; i < fields.length; i++) {
                    contentSize += fields[i].name.length + fields[i].value.length;
                }
            }

            // TODO: static time for images, probably need function
            const timeInSeconds = (4000 + (100 * contentSize * 1000));

            messageResult.delete(4000);

            // TODO
            // this.bot.log.info(messageResult.content.length);
            // this.bot.log.info(`time : ${timeInSeconds}`);
        }

        return (messageResult !== undefined ? new EditableMessage(messageResult) : null);
    }

    /**
     * @param {Object} sections
     * @param {string} color
     * @return {Promise<EditableMessage>}
     */
    async sections(sections: any, color: string = "GREEN"): Promise<EditableMessage | null> {
        return await this.respond(EmbedBuilder.sections(sections, color));
    }

    /**
     * @param {string} text
     * @param {string} [title=""]
     * @return {Promise<EditableMessage>}
     */
    async ok(text: string, title: string = ""): Promise<EditableMessage | null> {
        return await this.respond({
            text: `${text}`,
            title: title
        });
    }

    /**
     * @param {string} text
     * @return {Promise<EditableMessage>}
     */
    async loading(text: string): Promise<EditableMessage | null> {
        return await this.respond({
            text: `${text}`,
            color: "BLUE"
        });
    }

    /**
     * @param {string} text
     * @return {Promise<EditableMessage | null>}
     */
    async fail(text: string): Promise<EditableMessage | null> {
        return await this.respond({
            text: `:thinking: ${text}`,
            color: "RED"
        }, true);
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Null>}
     */
    async reply(message: string): Promise<Message | Message[] | null> {
        return await this.message.reply(message);
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Message>}
     */
    async privateReply(message: string): Promise<Message | Message[]> {
        return await this.message.author.send(message);
    }

    /**
     * @return {number}
     */
    get senderAuth(): number {
        return this.getAuth(this.sender.id);
    }

    /**
     * @return {User}
     */
    get sender(): User {
        return this.message.author;
    }
}
