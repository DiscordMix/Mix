import {Client, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import Context from "../commands/context";
import Log from "../core/log";
import {PromiseOr} from "@atlas/xlib";

/**
 * The type of action performed by a setup helper.
 */
export enum SetupHelperActionType {
    Input,
    Question
}

export interface IFromContextOptions {
    readonly context: Context;
    readonly title?: string;
    readonly embed?: boolean;
    readonly timeout?: number;
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

export interface ISetupHelper {
    input(text: string): this;
    question(text: string): this;
    finish(responseHandler?: ResponseHandler): PromiseOr<ISetupHelperResult>;
}

export default class SetupHelper implements ISetupHelper {
    /**
     * Create a SetupHelper class instance from a command context.
     */
    public static fromContext(options: IFromContextOptions): SetupHelper | null {
        if (options.context.msg.channel instanceof TextChannel) {
            // context.bot.client, context.message.channel, context.sender.id, title, timeout, embed
            return new SetupHelper({
                channel: options.context.msg.channel,
                client: options.context.bot.client,
                title: options.title,
                userId: options.context.sender.id,
                timeout: options.timeout,
                embed: options.embed
            });
        }

        Log.warn(`Expecting channel to be of type 'TextChannel' but was '${options.context.msg.channel.type}'`);

        return null;
    }

    protected readonly client: any;
    protected readonly channel: TextChannel;
    protected readonly userId: Snowflake;
    protected readonly title?: string;
    protected readonly timeout: number;
    protected readonly embed: boolean;
    protected readonly actionMap: ISetupHelperAction[];

    public constructor(options: ISetupHelperOptions) {
        this.client = options.client;
        this.channel = options.channel;
        this.userId = options.userId;
        this.title = options.title;
        this.timeout = options.timeout || 60;
        this.embed = options.embed !== undefined ? options.embed : true;
        this.actionMap = [];
    }

    public input(text: string): this {
        this.actionMap.push({
            type: SetupHelperActionType.Input,
            text
        });

        return this;
    }

    public question(text: string): this {
        this.actionMap.push({
            type: SetupHelperActionType.Question,
            text
        });

        return this;
    }

    public async finish(responseHandler?: ResponseHandler): Promise<ISetupHelperResult> {
        const responses: string[] = [];

        for (let i: number = 0; i < this.actionMap.length; i++) {
            // TODO: Inefficient check position.
            if (this.embed) {
                this.channel.send(new RichEmbed()
                    .setTitle(this.title)
                    .setColor("GREEN")
                    .setDescription(this.actionMap[i].text)

                    // TODO: Should be username instead of id.
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
                    responses,
                    expired: true
                };
            }
        }

        return {
            responses,
            expired: false
        };
    }

    protected awaitResponse(): Promise<string | null> {
        return new Promise((resolve) => {
            // Timeout after x seconds.
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
}
