import {Message, RichEmbed, TextChannel, User} from "discord.js";
import Discord from "discord.js";
import EmbedBuilder from "../builders/embedBuilder";
import MsgBuilder from "../builders/msgBuilder";
import EditableMessage from "../core/editableMessage";
import Log from "../core/log";
import Util from "./util";
import {IBot} from "../core/botExtra";
import {botLists} from "../core/constants";

export interface IResponseHelper {
    readonly channel: TextChannel;
    readonly bot: IBot;
    readonly sender: User;

    fileStream(stream: any, name: string): Promise<EditableMessage | null>;
    respond(content: EmbedBuilder | any, autoDelete: boolean): Promise<EditableMessage | null>;
    sections(sections: any, color: string): Promise<EditableMessage | null>;
    pass(text: string | MsgBuilder, title: string, clean: boolean): Promise<EditableMessage | null>;
    send(text: string | RichEmbed | Message): Promise<EditableMessage | null>;
    loading(text: string): Promise<EditableMessage | null>;
    fail(text: string, autoDelete: boolean): Promise<EditableMessage | null>;
}

export default class ResponseHelper implements IResponseHelper {
    public readonly channel: TextChannel;
    public readonly bot: IBot;
    public readonly sender: User;

    public constructor(channel: TextChannel, bot: IBot, sender: User) {
        this.channel = channel;
        this.bot = bot;
        this.sender = sender;
    }

    public async fileStream(stream: any, name: string): Promise<EditableMessage | null> {
        return new EditableMessage(await this.channel.send(new Discord.Attachment(stream, name)));
    }

    // TODO: Content parameter type.
    public async respond(content: EmbedBuilder | any, autoDelete: boolean = false): Promise<EditableMessage | null> {
        let embed: EmbedBuilder | null = null;

        const finalContent: EmbedBuilder | any = Object.assign({}, content);

        if (typeof finalContent.text === "string") {
            if (finalContent.text.trim() === "" || finalContent.text === undefined || finalContent.text === null) {
                finalContent.text = ":thinking: *Empty response*";
            }
            else if (finalContent.text.length > 1024) {
                if (finalContent.text.endsWith("```")) {
                    finalContent.text = finalContent.text.substring(0, 1021) + "```";
                }

                // TODO: ... not being added at the end.
                finalContent.text = finalContent.text.substring(0, 1020) + " ...";

                Log.warn("Attempted to send a message with more than 1024 characters (Discord limit); The message was automatically trimmed");
            }

            finalContent.text = Util.escapeText(finalContent.text, this.bot.client.token);
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

        let messageResult = await this.channel.send(embed.build()).catch((error: Error) => {
            if (!botLists.has(this.channel.guild.id)) {
                // TODO: Commented out, this.privateReply method was moved.
                // this.privateReply(`Oh no! For some reason, I was unable to reply to you in that channel. (${error.message})`);
            }
        });

        // TODO: Hotfix.
        if (Array.isArray(messageResult)) {
            messageResult = messageResult[0];
        }

        if (autoDelete && messageResult) {
            const buildEmbed: RichEmbed = embed.build();
            const fields: any = buildEmbed.fields;

            let contentSize: number = 0;

            if (fields) {
                for (const field of fields) {
                    contentSize += field.name.length + field.value.length;
                }
            }

            if (buildEmbed.description) {
                contentSize += buildEmbed.description.length;
            }

            const timeToLive: number = 4000 + (100 * contentSize);

            // Time depends on length.
            messageResult.delete(timeToLive);
        }

        return (!!messageResult ? new EditableMessage(messageResult) : null);
    }

    // TODO: For some reason not having 'Requested by' footer.
    public async sections(sections: any, color: string = "GREEN"): Promise<EditableMessage | null> {
        return await this.respond(EmbedBuilder.sections(sections, color));
    }

    /**
     * @param {boolean} [clean = true] Whether to filter the message.
     */
    public async pass(text: string | MsgBuilder, title: string = "", clean: boolean = true): Promise<EditableMessage | null> {
        return await this.respond({
            text: typeof text === "string" ? `:white_check_mark: ${text}` : text.build(),
            title
        });
    }

    /**
     * @deprecated Use pass() instead.
     * @param {boolean} [clean=true] Whether to filter the message.
     */
    public async ok(text: string | MsgBuilder, title: string = "", clean: boolean = true): Promise<EditableMessage | null> {
        return await this.respond({
            text: typeof text === "string" ? `:white_check_mark: ${text}` : text.build(),
            title
        });
    }

    public async send(text: string | RichEmbed | Message): Promise<EditableMessage | null> {
        return new EditableMessage(await this.channel.send(text));
    }

    public async loading(text: string): Promise<EditableMessage | null> {
        return await this.respond({
            // TODO: Isn't the emoji missing?
            text,
            color: "BLUE"
        });
    }

    public async fail(text: string, autoDelete: boolean = true): Promise<EditableMessage | null> {
        return await this.respond({
            text: `:thinking: ${text}`,
            color: "RED"
        }, autoDelete);
    }
}
