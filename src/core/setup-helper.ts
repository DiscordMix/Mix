import {Client, Message, RichEmbed, Snowflake, TextChannel, User} from "discord.js";
import CommandContext from "../commands/command-context";
import Log from "./log";

export enum SetupHelperActionType {
    Input,
    Question
}

export interface SetupHelperAction {
    readonly type: SetupHelperActionType;
    readonly text: string;
}

export interface SetupHelperResult {
    readonly responses: Array<string>;
    readonly expired: boolean;
}

export default class SetupHelper {
    private readonly client: any;
    private readonly channel: TextChannel;
    private readonly userId: Snowflake;
    private readonly title?: string;
    private readonly timeout: number;
    private readonly embed: boolean;
    private readonly actionMap: Array<SetupHelperAction>;

    constructor(client: any, channel: TextChannel, userId: Snowflake, title?: string, timeout: number = 60, embed: boolean = true) {
        this.client = client;
        this.channel = channel;
        this.userId = userId;
        this.title = title;
        this.timeout = timeout;
        this.embed = embed;
        this.actionMap = [];
    }

    input(text: string): SetupHelper {
        this.actionMap.push({
            type: SetupHelperActionType.Input,
            text: text
        });

        return this;
    }

    question(text: string): SetupHelper {
        this.actionMap.push({
            type: SetupHelperActionType.Question,
            text: text
        });

        return this;
    }

    async finish(responseHandler?: (response: string) => string): Promise<SetupHelperResult> {
        const responses: Array<string> = [];

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
                responses.push(responseHandler ? responseHandler(response) : response);
            }
            else {
                return {
                    responses: responses,
                    expired: true
                };
            }
        }

        console.log("done");

        return {
            responses: responses,
            expired: false
        };
    }

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

    static fromContext(context: CommandContext, title?: string, embed?: boolean, timeout?: number): SetupHelper | null {
        if (context.message.channel instanceof TextChannel) {
            return new SetupHelper(context.bot.client, context.message.channel, context.sender.id, title, timeout, embed);
        }
        else {
            Log.warn(`[SetupHelper.fromContext] Expecting channel to be of type 'TextChannel' but was '${context.message.channel.type}'`);

            return null;
        }
    }
}
