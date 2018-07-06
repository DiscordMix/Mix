import Log from "../core/log";
import {Message} from "discord.js";

const Discord = require("discord.js");

export interface MessageEditOptions {
    readonly message: string;
    readonly title?: string;
    readonly color?: string;
    readonly thumbnailUrl?: string;
    readonly imageUrl?: string;
}

export default class EditableMessage {
    private readonly message: Message;

    /**
     * @todo Verify param "message"'s type
     * @param {Discord.Message|Array<Discord.Message>} message
     */
    constructor(message: Message | Message[]) {
        // TODO: Hotfix
        if (Array.isArray(message)) {
            message = message[0];
        }

        if (message.embeds.length === 0) {
            Log.error("[EditableMessage] Message parameter must contain embeds");
        }

        /**
         * @type {Message}
         * @private
         * @readonly
         */
        this.message = message;
    }

    /**
     * Edit an already sent message
     * @param {MessageEditOptions} options
     * @return {Promise<Message>}
     */
    async edit(options: MessageEditOptions): Promise<Message> {
        // TODO: Default values?
        return this.message.edit("", new Discord.RichEmbed()
            .setColor(options.color)
            .setDescription(options.message)
            .setAuthor(options.title, options.thumbnailUrl)
            .setImage(options.imageUrl));
    }
}
