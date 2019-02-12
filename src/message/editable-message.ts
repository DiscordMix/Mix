import Discord, {Message} from "discord.js";
import Log from "../core/log";

export interface IMessageEditOptions {
    readonly message: string;
    readonly title?: string;
    readonly color?: string;
    readonly thumbnailUrl?: string;
    readonly imageUrl?: string;
}

export interface IEditableMessage {
    readonly msg: Message;

    edit(options: IMessageEditOptions): Promise<Message>;
}

export default class EditableMessage implements IEditableMessage {
    public readonly msg: Message;

    // TODO: Verify param "message"'s type.
    public constructor(msg: Message | Message[]) {
        // TODO: Hotfix.
        if (Array.isArray(msg)) {
            Log.warn("Arrays are not supported as the message parameter, choosing the first element");
            msg = msg[0];
        }

        this.msg = msg;
    }

    /**
     * Edit an already sent message.
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
