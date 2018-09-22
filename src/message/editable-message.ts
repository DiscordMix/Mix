import Log from "../core/log";
import Discord, {Message} from "discord.js";

export type MessageEditOptions = {
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
     * @param {Message | Array<Message>} message
     */
    constructor(message: Message | Array<Message>) {
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
    public async edit(options: MessageEditOptions): Promise<Message> {
        // TODO: Default values?
        return this.message.edit("", new Discord.RichEmbed()
            .setColor(options.color ? options.color : "")
            .setDescription(options.message)
            .setAuthor(options.title, options.thumbnailUrl)
            .setImage(options.imageUrl ? options.imageUrl : ""));
    }
}
