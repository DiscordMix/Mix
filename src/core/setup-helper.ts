import {Client, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import CommandContext from "../commands/command-context";
import Log from "./log";

export enum SetupHelperActionType {
    Input,
    Question
}

export interface FromContextOptions {
    readonly context: CommandContext;
    readonly title?: string;
    readonly embed?: boolean;
    readonly timeout?: number
}

export interface SetupHelperOptions {
    readonly client: Client;
    readonly channel: TextChannel;
    readonly userId: Snowflake;
    readonly title?: string;
    readonly timeout?: number;
    readonly embed?: boolean;
}

export interface SetupHelperAction {
    readonly type: SetupHelperActionType;
    readonly text: string;
}

export interface SetupHelperResult {
    readonly responses: string[];
    readonly expired: boolean;
}

export type IResponseHandler = (response: string, index: number) => string;

export default class SetupHelper {
    private readonly client: any;
    private readonly channel: TextChannel;
    private readonly userId: Snowflake;
    private readonly title?: string;
    private readonly timeout: number;
    private readonly embed: boolean;
    private readonly actionMap: SetupHelperAction[];

    /**
     * @param {SetupHelperOptions} options
     */
    constructor(options: SetupHelperOptions) {
        /**
         * @type {*}
         * @private
         * @readonly
         */
        this.client = options.client;

        /**
         * @type {TextChannel}
         * @private
         * @readonly
         */
        this.channel = options.channel;

        /**
         * @type {Snowflake}
         * @private
         * @readonly
         */
        this.userId = options.userId;

        /**
         * @type {string | undefined}
         * @private
         * @readonly
         */
        this.title = options.title;

        /**
         * @type {number}
         * @private
         * @readonly
         */
        this.timeout = options.timeout || 60;

        /**
         * @type {boolean}
         * @private
         * @readonly
         */
        this.embed = options.embed !== undefined ? options.embed : true;

        /**
         * @type {SetupHelperAction[]}
         * @private
         * @readonly
         */
        this.actionMap = [];
    }

    /**
     * @param {string} text
     * @return {this}
     */
    public input(text: string): this {
        this.actionMap.push({
            type: SetupHelperActionType.Input,
            text: text
        });

        return this;
    }

    /**
     * @param {string} text
     * @return {this}
     */
    public question(text: string): this {
        this.actionMap.push({
            type: SetupHelperActionType.Question,
            text: text
        });

        return this;
    }

    /**
     * @param {IResponseHandler} responseHandler
     * @return {Promise<SetupHelperResult>}
     */
    public async finish(responseHandler?: IResponseHandler): Promise<SetupHelperResult> {
        const responses: string[] = [];

        for (let i = 0; i < this.actionMap.length; i++) {
            // TODO: Inefficient check position
            if (this.embed) {
                this.channel.send(new RichEmbed()
                    .setTitle(this.title)
                    .setColor("GREEN")
                    .setDescription(this.actionMap[i].text)

                    // TODO: Should be username instead of id
                    .setFooter(`Requested by ${this.userId} | Step ${i + 1}/${this.actionMap.length}`));
            }
            else {
                this.channel.send(`[${this.title}] ${this.actionMap[i].text}`);
            }

            const response = await this.awaitResponse();

            if (response !== null) {
                responses.push(responseHandler ? responseHandler(response, i) : response);
            }
            else {
                return {
                    responses: responses,
                    expired: true
                };
            }
        }

        return {
            responses: responses,
            expired: false
        };
    }

    /**
     * @return {Promise<string | null>}
     */
    private awaitResponse(): Promise<string | null> {
        return new Promise((resolve) => {
            // Timeout after x seconds
            const responseTimeout = setTimeout(() => {
                this.channel.send(new RichEmbed()
                    .setTitle(`${this.title} Expired`)
                    .setColor("GOLD")
                    .setDescription(`The setup automatically expired after **${this.timeout}** seconds of inactivity`));

                resolve(null);
            }, this.timeout * 1000);

            const messageHandler = (message: Message) => {
                if (message.author.id === this.userId && message.channel.id === this.channel.id) {
                    clearTimeout(responseTimeout);
                    resolve(message.content);
                    this.client.removeListener("message", messageHandler);
                }
            };

            this.client.on("message", messageHandler);
        });
    }

    /**
     * @param {FromContextOptions} options
     * @return {SetupHelper | null}
     */
    public static fromContext(options: FromContextOptions): SetupHelper | null {
        if (options.context.message.channel instanceof TextChannel) {
            //context.bot.client, context.message.channel, context.sender.id, title, timeout, embed
            return new SetupHelper({
                client: options.context.bot.client,
                channel: options.context.message.channel,
                userId: options.context.sender.id,
                title: options.title,
                embed: options.embed,
                timeout: options.timeout
            });
        }

        Log.warn(`[SetupHelper.fromContext] Expecting channel to be of type 'TextChannel' but was '${options.context.message.channel.type}'`);

        return null;
    }
}
