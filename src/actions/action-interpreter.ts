import Bot from "../core/bot";
import {IAction, ActionType} from "./action";
import {Snowflake, Channel, TextChannel, Guild, User, ChannelResolvable} from "discord.js";
import { Log } from "..";

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

export enum ChannelType {
    Text = "text",
    DM = "dm",
    Group = "group"
}

export default class InstructionInterpreter {
    private readonly bot: Bot;

    public constructor(bot: Bot) {
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

            default: {
                // TODO: Support for custom actions
                Log.warn(`Unable to interpret unknown action type: ${action.type}`);
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