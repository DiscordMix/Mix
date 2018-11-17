import Bot from "../core/bot";
import {IAction, ActionType} from "./action";
import {Snowflake, Channel, TextChannel, Guild, User, RichEmbed, Message} from "discord.js";
import {Log, Utils, PaginatedMessage, EmojiMenu, CommandContext} from "..";
import {EventEmitter} from "events";

// Arg types
export type IMessageActionArgs = {
    readonly channelId: Snowflake;
    readonly message: string;
}

export type IGuildLeaveActionArgs = {
    readonly guildId: Snowflake;
}

export type IPrivateMessageActionArgs = {
    readonly userId: Snowflake;
    readonly message: string;
}

export interface IRequestActionArgs extends IMessageActionArgs {
    readonly requester: string;
    readonly avatarUrl: string;
}

export type IEmbedActionArgs = {
    readonly channelId: Snowflake;
    readonly embed: RichEmbed;
}

export type IPaginatedActionArgs = {
    readonly message: string;
    readonly inputMessage: Message;
    readonly bot: Bot;
    readonly context: CommandContext;
}

export enum ChannelType {
    Text = "text",
    DM = "dm",
    Group = "group"
}

// TODO: Possibly consider attaching ActionInterpreter into commands' "this" so it's easier to return and ActionInterpreter can auto-determine some stuff...
export default class ActionInterpreter extends EventEmitter {
    private readonly bot: Bot;

    public constructor(bot: Bot) {
        super();

        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;
    }

    public async interpret(action: IAction<any>): Promise<void> {
        switch (action.type) {
            case ActionType.Message: {
                const act: IAction<IMessageActionArgs> = action;
                const channel: TextChannel | null = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return;
                }

                await (channel as TextChannel).send(act.args.message);

                break;
            }

            case ActionType.RichEmbed: {
                const act: IAction<IEmbedActionArgs> = action;
                const channel: TextChannel | null = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return;
                }

                await (channel as TextChannel).send(act.args.embed);

                break;
            }

            case ActionType.GuildLeave: {
                const act: IAction<IGuildLeaveActionArgs> = action;

                if (!this.bot.client.guilds.has(act.args.guildId)) {
                    this.error(act.type, `Bot is not part of the guild '${act.args.guildId}' or guild does not exist`);

                    return;
                }

                await (this.bot.client.guilds.get(act.args.guildId) as Guild).leave();

                break;
            }

            case ActionType.PrivateMessage: {
                const act: IAction<IPrivateMessageActionArgs> = action;

                if (!this.bot.client.users.has(act.args.userId)) {
                    this.error(act.type, `User '${act.args.userId}' is either invalid or not cached by the client`);

                    return;
                }

                const user: User = this.bot.client.users.get(act.args.userId) as User;

                await (await user.createDM()).send(act.args.message);

                break;
            }

            case ActionType.Reply: {
                const act: IAction<IMessageActionArgs> = action;
                const channel: TextChannel | null = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return;
                }

                await (channel as TextChannel).send(act.args.message);

                break;
            }

            case ActionType.OkEmbed: {
                const act: IAction<IRequestActionArgs> = action;
                const channel: TextChannel | null = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return;
                }

                await Utils.send({
                    channel,
                    color: "GREEN",
                    footer: `Requested by ${act.args.requester}`,
                    message: act.args.message,
                    avatarUrl: act.args.avatarUrl
                });

                break;
            }

            case ActionType.PaginatedOkEmbed: {
                const act: IAction<IPaginatedActionArgs> = action;
                const channel: TextChannel | null = this.ensureChannel(act.args.inputMessage.channel.id, act.type);

                if (channel === null) {
                    return;
                }

                const paginatedMessage: PaginatedMessage = new PaginatedMessage(act.args.message);

                const message: Message = await channel.send(new RichEmbed()
                    .setColor("GREEN")
                    .setDescription(paginatedMessage.getPage())) as Message;

                // TODO: Debugging?
                new EmojiMenu(message.id, act.args.inputMessage.author.id)
                    .add({
                        emoji: "495380506372734980",

                        async clicked(): Promise<void> {
                            paginatedMessage.previous();

                            await message.edit(new RichEmbed()
                                .setColor("GREEN")
                                .setDescription(paginatedMessage.getPage()));
                        }
                    })
                    .add({
                        emoji: "490721272607670272",

                        async clicked(): Promise<void> {
                            paginatedMessage.next();

                            await message.edit(new RichEmbed()
                                .setColor("GREEN")
                                .setDescription(paginatedMessage.getPage()));
                        }
                    })
                    .attach(act.args.context);

                break;
            }
            
            case ActionType.FailEmbed: {
                const act: IAction<IRequestActionArgs> = action;
                const channel: TextChannel | null = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return;
                }

                await Utils.send({
                    channel,
                    color: "RED",
                    footer: `Requested by ${act.args.requester}`,
                    message: act.args.message,
                    avatarUrl: act.args.avatarUrl
                });

                break;
            }

            default: {
                if (action.type >= 1000) {
                    // TODO: Override on() from EventEmitter because emitting converted number
                    this.emit(action.type.toString());
                }
                else {
                    Log.warn(`Unable to interpret unknown action type: ${action.type}`);
                }
            }
        }
    }

    public async interpretMany(actions: IAction<any>[]): Promise<void> {
        for (let i: number = 0; i < actions.length; i++) {
            await this.interpret(actions[i]);
        }
    }

    private ensureChannel<ReturnType = TextChannel>(channelId: Snowflake, actionType: ActionType, type: ChannelType = ChannelType.Text): ReturnType | null {
        if (!this.bot.client.channels.has(channelId)) {
            this.error(actionType, `Unknown channel '${channelId}'`);

            return null;
        }

        const channel: Channel = this.bot.client.channels.get(channelId) as Channel;

        if (channel.type !== "text") {
            this.error(actionType, `Channel '${channelId}' does not match required channel type: ${type}`);

            return null;
        }

        return channel as any;
    }

    private error(type: ActionType, message: string): void {
        Log.error(`[InstructionInterpreter.interpret] Could not interpret instruction (${ActionType[type].toString()}): ${message}`);
    }
}