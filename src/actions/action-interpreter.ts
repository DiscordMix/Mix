import Bot from "../core/bot";
import {IAction, ActionType} from "./action";
import {Snowflake, Channel, TextChannel, Guild, User, RichEmbed, Message} from "discord.js";
import {EventEmitter} from "events";
import Context from "../commands/command-context";
import PaginatedMessage from "../pagination/paginated-message";
import EmojiMenu from "../emoji-menu/emoji-menu";
import Log from "../core/log";
import Util from "../core/utils";
import {PromiseOr} from "@atlas/xlib";

// Arg types
export interface IMessageActionArgs {
    readonly channelId: Snowflake;
    readonly message: string;
}

export interface IGuildLeaveActionArgs {
    readonly guildId: Snowflake;
}

export interface IPrivateMessageActionArgs {
    readonly userId: Snowflake;
    readonly message: string;
}

export interface IRequestActionArgs extends IMessageActionArgs {
    readonly requester: string;
    readonly avatarUrl: string;
}

export interface IEmbedActionArgs {
    readonly channelId: Snowflake;
    readonly embed: RichEmbed;
}

export interface IPaginatedActionArgs {
    readonly message: string;
    readonly inputMessage: Message;
    readonly bot: Bot;
    readonly context: Context;
}

export enum ChannelType {
    Text = "text",
    DM = "dm",
    Group = "group"
}

export interface IActionInterpreter extends EventEmitter {
    interpret(action: IAction): PromiseOr<this>;
    interpretMany(actions: IAction[]): PromiseOr<this>;
}

// TODO: Possibly consider attaching ActionInterpreter into commands' "this" so it's easier to return and ActionInterpreter can auto-determine some stuff...
/**
 * @extends EventEmitter
 */
export default class ActionInterpreter extends EventEmitter implements IActionInterpreter {
    protected readonly bot: Bot;

    public constructor(bot: Bot) {
        super();

        /**
         * @type {Bot}
         * @protected
         * @readonly
         */
        this.bot = bot;
    }

    /**
     * @param {IAction} action
     * @return {Promise<this>}
     */
    public async interpret(action: IAction): Promise<this> {
        switch (action.type) {
            case ActionType.Message: {
                const act: IAction<IMessageActionArgs> = action;
                const channel: TextChannel = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return this;
                }

                await (channel as TextChannel).send(act.args.message);

                break;
            }

            case ActionType.RichEmbed: {
                const act: IAction<IEmbedActionArgs> = action;
                const channel: TextChannel = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return this;
                }

                await (channel as TextChannel).send(act.args.embed);

                break;
            }

            case ActionType.GuildLeave: {
                const act: IAction<IGuildLeaveActionArgs> = action;

                if (!this.bot.client.guilds.has(act.args.guildId)) {
                    this.error(act.type, `Bot is not part of the guild '${act.args.guildId}' or guild does not exist`);

                    return this;
                }

                await (this.bot.client.guilds.get(act.args.guildId) as Guild).leave();

                break;
            }

            case ActionType.PrivateMessage: {
                const act: IAction<IPrivateMessageActionArgs> = action;

                if (!this.bot.client.users.has(act.args.userId)) {
                    this.error(act.type, `User '${act.args.userId}' is either invalid or not cached by the client`);

                    return this;
                }

                const user: User = this.bot.client.users.get(act.args.userId) as User;

                await (await user.createDM()).send(act.args.message);

                break;
            }

            case ActionType.Reply: {
                const act: IAction<IMessageActionArgs> = action;
                const channel: TextChannel = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return this;
                }

                await (channel as TextChannel).send(act.args.message);

                break;
            }

            case ActionType.OkEmbed: {
                const act: IAction<IRequestActionArgs> = action;
                const channel: TextChannel = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return this;
                }

                await Util.send({
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
                const channel: TextChannel = this.ensureChannel(act.args.inputMessage.channel.id, act.type);

                if (channel === null) {
                    return this;
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
                const channel: TextChannel = this.ensureChannel(act.args.channelId, act.type);

                if (channel === null) {
                    return this;
                }

                await Util.send({
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

        return this;
    }

    public async interpretMany(actions: IAction[]): Promise<this> {
        for (const action of actions) {
            await this.interpret(action);
        }

        return this;
    }

    protected ensureChannel<T extends Channel = TextChannel>(channelId: Snowflake, actionType: ActionType, type: ChannelType = ChannelType.Text): T {
        if (!this.bot.client.channels.has(channelId)) {
            this.error(actionType, `Unknown channel '${channelId}'`);
        }

        const channel: Channel = this.bot.client.channels.get(channelId) as Channel;

        if (channel.type !== "text") {
            this.error(actionType, `Channel '${channelId}' does not match required channel type: ${type}`);
        }

        return channel as any;
    }

    protected error(type: ActionType, message: string): void {
        throw Log.error(`Could not interpret instruction (${ActionType[type].toString()}): ${message}`);
    }
}
