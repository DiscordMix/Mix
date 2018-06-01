import Log from "../core/log";
import {Message} from "discord.js";

const Discord = require("discord.js");

export default class EditableMessage {
    readonly message: Message;

    /**
     * @param {Discord.Message} message
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
         * @type {Discord.Message}
         * @private
         * @readonly
         */
        this.message = message;
    }

    /**
     * Edit an already sent message
     * @param {string} message
     * @param {string} title
     * @param {string} color
     * @param {string} thumbnailUrl
     * @param {string} [image=""]
     * @returns {Promise<Message>}
     */
    async edit(message: string, title: string = "", color: string = "RANDOM", thumbnailUrl: string = "", image: string = ""): Promise<Message> {
        return this.message.edit("", new Discord.RichEmbed()
            .setColor(color)
            .setDescription(message)
            .setAuthor(title, thumbnailUrl)
            .setImage(image));
    }
}
