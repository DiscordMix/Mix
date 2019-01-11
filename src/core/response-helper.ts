import {Message, RichEmbed, TextChannel, User} from "discord.js";
import Discord from "discord.js";
import EmbedBuilder from "../builders/embed-builder";
import MsgBuilder from "../builders/msg-builder";
import EditableMessage from "../message/editable-message";
import Bot from "./bot";
import Log from "./log";
import Utils from "./utils";

export interface IResponseHelper {
    readonly channel: TextChannel;
    readonly bot: Bot;
    readonly sender: User;

    fileStream(stream: any, name: string): Promise<EditableMessage | null>;
    respond(content: EmbedBuilder | any, autoDelete: boolean): Promise<EditableMessage | null>;
    sections(sections: any, color: string): Promise<EditableMessage | null>;
    ok(text: string | MsgBuilder, title: string, clean: boolean): Promise<EditableMessage | null>;
    send(text: string | RichEmbed | Message): Promise<EditableMessage | null>;
    loading(text: string): Promise<EditableMessage | null>;
    fail(text: string, autoDelete: boolean): Promise<EditableMessage | null>;
}

export default class ResponseHelper implements IResponseHelper {
    public readonly channel: TextChannel;
    public readonly bot: Bot;
    public readonly sender: User;

    public constructor(channel: TextChannel, bot: Bot, sender: User) {
        /**
         * @type {TextChannel}
         * @readonly
         */
        this.channel = channel;

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {User}
         * @readonly
         */
        this.sender = sender;
    }

    /**
     * @param {*} stream
     * @param {string} name
     * @return {Promise<EditableMessage | null>}
     */
    public async fileStream(stream: any, name: string): Promise<EditableMessage | null> {
        return new EditableMessage(await this.channel.send(new Discord.Attachment(stream, name)));
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
            else if (finalContent.text.length > 1024) {
                if (finalContent.text.endsWith("```")) {
                    finalContent.text = finalContent.text.substring(0, 1021) + "```";
                }

                // TODO: ... not being added at the end
                finalContent.text = finalContent.text.substring(0, 1020) + " ...";

                Log.warn("[Context.respond] Attempted to send a message with more than 1024 characters (Discord limit); The message was automatically trimmed");
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

        let messageResult = await this.channel.send(embed.build()).catch((error: Error) => {
            if (!Utils.botLists.includes(this.channel.guild.id)) {
                // TODO: Commented out, this.privateReply method was moved
                //this.privateReply(`Oh no! For some reason, I was unable to reply to you in that channel. (${error.message})`);
            }
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
                for (let i: number = 0; i < fields.length; i++) {
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

        return (!!messageResult ? new EditableMessage(messageResult) : null);
    }

    /**
     * @todo For some reason not having 'Requested by' footer
     * @param {*} sections
     * @param {string} color
     * @return {Promise<EditableMessage | null>}
     */
    public async sections(sections: any, color: string = "GREEN"): Promise<EditableMessage | null> {
        return await this.respond(EmbedBuilder.sections(sections, color));
    }

    /**
     * @param {string} text
     * @param {string} [title=""]
     * @param {boolean} [clean=true] Whether to filter the message
     * @return {Promise<EditableMessage | null>}
     */
    public async ok(text: string | MsgBuilder, title: string = "", clean: boolean = true): Promise<EditableMessage | null> {
        return await this.respond({
            text: typeof text === "string" ? `${this.bot.options.emojis.success} ${text}` : text.build(),
            title: title
        });
    }

    /**
     * @param {string} text
     * @return {Promise<EditableMessage | null>}
     */
    public async send(text: string | RichEmbed | Message): Promise<EditableMessage | null> {
        return new EditableMessage(await this.channel.send(text));
    }

    /**
     * @param {string} text
     * @return {Promise<EditableMessage | null>}
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
            color: "RED"
        }, autoDelete);
    }
}
