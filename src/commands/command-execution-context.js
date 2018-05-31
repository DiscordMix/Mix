import EditableMessage from "../message/editable-message";
import EmbedBuilder from "../message/embed-builder";

const Discord = require("discord.js");

export default class CommandExecutionContext {
    /**
     * @param {Object} data
     */
    constructor(data) {
        /**
         * @type {Message}
         * @readonly
         */
        this.message = data.message;

        /**
         * @type {Array<String>}
         * @readonly
         */
        this.arguments = data.args;

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = data.bot;

        /**
         * @type {AccessLevelType}
         * @readonly
         */
        this.auth = data.auth;

        /**
         * @type {EmojiCollection}
         * @readonly
         */
        this.emojis = data.emojis;
    }

    /**
     * @param {*} stream
     * @param {String} name
     * @returns {(Promise<EditableMessage>|Null)}
     */
    async fileStream(stream, name) {
        return await this.message.channel.send(new Discord.Attachment(stream, name));
    }

    /**
     * @param {(Object|EmbedBuilder)} content
     * @param {Boolean} [autoDelete=false]
     * @returns {(Promise<EditableMessage>|null)}
     */
    async respond(content, autoDelete = false) {
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

        const messageResult = await this.message.channel.send(embed.build()).catch((error) => {
            // TODO: Temporarily disabled due to spamming on unwanted servers.
            // this.privateReply(`Oh noes! For some reason, I was unable to reply to you in that channel. (${error.message})`);
        });

        if (autoDelete && messageResult) {
            // TODO: Cannot access .length in embeds
            // also static time for images, probably need function
            const timeInSeconds = (4000 + (100 * embed.build() * 1000)) / 1000;

            messageResult.delete(4000 + (100 * messageResult.content.length * 1000));

            // TODO
            // this.bot.log.info(messageResult.content.length);
            // this.bot.log.info(`time : ${timeInSeconds}`);
        }

        return (messageResult !== undefined ? new EditableMessage(messageResult) : null);
    }

    /**
     * @param {Snowflake} userId
     * @returns {AccessLevelType}
     */
    getAuth(userId) {
        return this.bot.authStore.getAuthority(this.message.guild.id, this.message.guild.member(userId).roles.array().map((role) => role.name), userId);
    }

    /**
     * @returns {AccessLevelType}
     */
    get auth() {
        return this.getAuth(this.sender.id);
    }

    /**
     * @param {Object} sections
     * @param {String} color
     * @returns {Promise<EditableMessage>}
     */
    async sections(sections, color = "GREEN") {
        return await this.respond(EmbedBuilder.sections(sections, color));
    }

    /**
     * @param {String} text
     * @returns {Promise<EditableMessage>}
     */
    async ok(text) {
        return await this.respond({
            text: `${text}`
        });
    }

    /**
     * @param {String} text
     * @returns {Promise<EditableMessage>}
     */
    async loading(text) {
        return await this.respond({
            text: `${text}`,
            color: "BLUE"
        });
    }

    /**
     * @param {String} text
     * @returns {Promise<EditableMessage>}
     */
    async fail(text) {
        return await this.respond({
            text: `:thinking: ${text}`,
            color: "RED"
        }, true);
    }

    /**
     * @returns {User}
     */
    get sender() {
        return this.message.author;
    }

    /**
     * @param {String} message
     * @returns {(Promise<Message>|null)}
     */
    async reply(message) {
        return await this.message.reply(message);
    }

    /**
     * @param {String} message
     */
    async privateReply(message) {
        return await this.message.author.send(message);
    }
}
