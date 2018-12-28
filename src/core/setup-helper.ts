import {Client, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import CommandContext from "../commands/command-context";
import Log from "./log";

export enum SetupHelperActionType {
    Input,
    Question
}

export interface IFromContextOptions {
    readonly context: CommandContext;
    readonly title?: string;
    readonly embed?: boolean;
    readonly timeout?: number
}

export interface ISetupHelperOptions {
    readonly client: Client;
    readonly channel: TextChannel;
    readonly userId: Snowflake;
    readonly title?: string;
    readonly timeout?: number;
    readonly embed?: boolean;
}

export interface ISetupHelperAction {
    readonly type: SetupHelperActionType;
    readonly text: string;
}

export interface ISetupHelperResult {
    readonly responses: string[];
    readonly expired: boolean;
}

export type ResponseHandler = (response: string, index: number) => string;

export default class SetupHelper {
    protected readonly client: any;
    protected readonly channel: TextChannel;
    protected readonly userId: Snowflake;
    protected readonly title?: string;
    protected readonly timeout: number;
    protected readonly embed: boolean;
    protected readonly actionMap: ISetupHelperAction[];

    /**
     * @param {ISetupHelperOptions} options
     */
    public constructor(options: ISetupHelperOptions) {
        /**
         * @type {*}
         * @protected
         * @readonly
         */
        this.client = options.client;

        /**
         * @type {TextChannel}
         * @protected
         * @readonly
         */
        this.channel = options.channel;

        /**
         * @type {Snowflake}
         * @protected
         * @readonly
         */
        this.userId = options.userId;

        /**
         * @type {string | undefined}
         * @protected
         * @readonly
         */
        this.title = options.title;

        /**
         * @type {number}
         * @protected
         * @readonly
         */
        this.timeout = options.timeout || 60;

        /**
         * @type {boolean}
         * @protected
         * @readonly
         */
        this.embed = options.embed !== undefined ? options.embed : true;

        /**
         * @type {ISetupHelperAction[]}
         * @protected
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
     * @param {ResponseHandler} responseHandler
     * @return {Promise<ISetupHelperResult>}
     */
    public async finish(responseHandler?: ResponseHandler): Promise<ISetupHelperResult> {
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
    protected awaitResponse(): Promise<string | null> {
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
     * @param {IFromContextOptions} options
     * @return {SetupHelper | null}
     */
    public static fromContext(options: IFromContextOptions): SetupHelper | null {
        if (options.context.msg.channel instanceof TextChannel) {
            //context.bot.client, context.message.channel, context.sender.id, title, timeout, embed
            return new SetupHelper({
                client: options.context.bot.client,
                channel: options.context.msg.channel,
                userId: options.context.sender.id,
                title: options.title,
                embed: options.embed,
                timeout: options.timeout
            });
        }

        Log.warn(`[SetupHelper.fromContext] Expecting channel to be of type 'TextChannel' but was '${options.context.msg.channel.type}'`);

        return null;
    }
}
