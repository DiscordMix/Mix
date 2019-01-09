import Log from "../core/log";
import Discord, {Message} from "discord.js";

export interface IMessageEditOptions {
    readonly message: string;
    readonly title?: string;
    readonly color?: string;
    readonly thumbnailUrl?: string;
    readonly imageUrl?: string;
}

export interface IEditableMessage {
    edit(options: IMessageEditOptions): Promise<Message>;

    readonly msg: Message;
}

export default class EditableMessage implements IEditableMessage {
    public readonly msg: Message;

    /**
     * @todo Verify param "message"'s type
     * @param {Message | Message[]} msg
     */
    public constructor(msg: Message | Message[]) {
        // TODO: Hotfix
        if (Array.isArray(msg)) {
            Log.warn("Arrays are not supported as the message parameter, choosing the first element");
            msg = msg[0];
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
