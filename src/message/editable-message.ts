import Log from "../core/log";
import Discord, {Message} from "discord.js";

export type IMessageEditOptions = {
    readonly message: string;
    readonly title?: string;
    readonly color?: string;
    readonly thumbnailUrl?: string;
    readonly imageUrl?: string;
}

export default class EditableMessage {
    public readonly msg: Message;

    /**
     * @todo Verify param "message"'s type
     * @param {Message | Message[]} msg
     */
    public constructor(msg: Message | Message[]) {
        // TODO: Hotfix
        if (Array.isArray(msg)) {
            msg = msg[0];
        }

        if (msg.embeds.length === 0) {
            Log.error("[EditableMessage] Message parameter must contain embeds");
        }

        /**
         * @type {Message}
         * @protected
         * @readonly
         */
        this.msg = msg;
    }

    /**
     * Edit an already sent message
     * @param {IMessageEditOptions} options
     * @return {Promise<Message>}
     */
    public async edit(options: IMessageEditOptions): Promise<Message> {
        // TODO: Default values?
        return this.msg.edit("", new Discord.RichEmbed()
            .setColor(options.color || "")
            .setDescription(options.message)
            .setAuthor(options.title, options.thumbnailUrl)
            .setImage(options.imageUrl || ""));
    }
}
