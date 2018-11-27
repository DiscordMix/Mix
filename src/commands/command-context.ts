import {Message, TextChannel, Snowflake, Guild, DMChannel, GroupDMChannel} from "discord.js";
import Bot from "../core/bot";
import ResponseHelper from "../core/response-helper";
import Utils from "../core/utils";
import {ChannelType} from "../actions/action-interpreter";
import {EmojiMenu, Log, EditableMessage} from "..";

export type ICommandExecutionContextOptions = {
    readonly msg: Message;
    readonly bot: Bot;
    readonly label: string | null;
}

export default class CommandContext<DataType = any, ChannelType = TextChannel | DMChannel | GroupDMChannel> extends ResponseHelper {
    public readonly bot: Bot;
    public readonly msg: Message;
    public readonly label: string | null;

    public data?: DataType;

    /**
     * @param {ICommandExecutionContextOptions} options
     */
    public constructor(options: ICommandExecutionContextOptions) {
        if (options.msg.channel.type !== "text") {
            throw new Error("[CommandContext] Expecting message's channel to be a text channel");
        }

        super(options.msg.channel as TextChannel, options.bot, options.msg.author);

        /**
         * @type {Message}
         * @readonly
         */
        this.msg = options.msg;

        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {string}
         * @readonly
         */
        this.label = options.label;
    }

    public get g(): Guild {
        return this.msg.guild;
    }

    public get c(): ChannelType {
        return this.msg.channel as any;
    }

    /**
     * @return {Snowflake}
     */
    public get triggeringMessageId(): Snowflake {
        return this.msg.id;
    }

    /**
     * Join all command arguments into a single string
     * @return {string}
     */
    public joinArguments(): string {
        if (!this.label) {
            return this.msg.content;
        }

        return this.msg.content.substr(this.label.length + 1);
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Message[] | null>}
     */
    public async reply(message: string): Promise<Message | Message[] | null> {
        return await this.msg.reply(Utils.escapeText(message, this.bot.client.token));
    }

    /**
     * @param {string} message
     * @return {Promise<Message | Message>}
     */
    public async privateReply(message: string): Promise<Message | Message[]> {
        return await this.msg.author.send(Utils.escapeText(message, this.bot.client.token));
    }

    /**
     * Request an input from the user
     * @param {string} message The message to send
     * @param {Snowflake} from The user to expect response from
     * @param {number} [timeout=7500] The time to wait until automatic cancellation
     * @return {Promise<string | null>}
     */
    public async createRequest(channel: TextChannel | DMChannel, message: string, from: Snowflake, timeout: number = 7500): Promise<string | null> {
        if (channel.type !== ChannelType.DM && channel.type !== ChannelType.Text) {
            throw new Error(`[CommandContext.createRequest] Epxecting channel '${channel.id}' to be either DMs or text-based`);
        }

        return new Promise<string | null>(async (resolve) => {
            const responseTimeout: NodeJS.Timeout = this.bot.setTimeout(() => {
                this.bot.client.removeListener("message", listener);
                resolve(null);
            }, timeout);
    
            const listener: any = (msg: Message) => {
                if (msg.author.id !== from || msg.channel.id !== channel.id || !msg.content || typeof msg.content !== "string" || msg.content.startsWith("|")) {
                    return;
                }
    
                this.bot.clearTimeout(responseTimeout);
                resolve(msg.content);
            };
    
            this.bot.client.on("message", listener);
            await channel.send(message);
        });
    }

    /**
     * @param {string} message
     * @param {Promise<number | undefined>} timeout
     */
    public async request(message: string, timeout?: number): Promise<string | null> {
        return this.createRequest(this.msg.channel as TextChannel | DMChannel, message, this.msg.author.id, timeout);
    }

    /**
     * @param {string} message
     * @param {number | undefined} timeout
     * @return {Promise<string | null>}
     */
    public async requestDM(message: string, timeout?: number): Promise<string | null> {
        return this.createRequest(await this.msg.author.createDM(), message, this.msg.author.id, timeout);
    }

    /**
     * @param message
     * @param timeout
     */
    public async promptDM(message: string, timeout: number = 7500): Promise<boolean | null> {
        const response: EditableMessage | null = await this.send(message);

        if (!response) {
            return false;
        }

        return await Utils.createTimedAction<Promise<boolean>>(this.bot, (): Promise<boolean> => {
            return new Promise<boolean>((resolve) => {
                new EmojiMenu(response.msg.id, this.msg.author.id, [
                    {
                        emoji: "white_check_mark",
        
                        clicked: () => {
                            Log.debug("Check clicked!")
                            resolve(true);
                        }
                    },
                    {
                        emoji: "regional_indicator_x",

                        clicked: () => {
                            Log.debug("X clicked!");
                            resolve(false);
                        }
                    }
                ]);
            });
        }, timeout, null);
    }
}
