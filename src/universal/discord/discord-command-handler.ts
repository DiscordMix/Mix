import CommandHandler, {ICommandHandler} from "../../commands/command-handler";
import DiscordContext from "../../commands/command-context";
import Command, {RawArguments, RestrictGroup as DiscordRestrictGroup} from "../../commands/command";
import DiscordChatEnv from "../../core/discord-chat-env";
import {DiscordSnowflake} from "../../core/bot-extra";
import {GuildMember} from "discord.js";

export interface IDiscordCommandHandler extends ICommandHandler {
    //
}

export default class DiscordCommandHandler extends CommandHandler implements IDiscordCommandHandler {
    /**
     * @param {Command} command
     * @param {DiscordContext} context
     * @return {boolean}
     */
    public static specificMet(command: Command, context: DiscordContext): boolean {
        let met: boolean = false;

        for (const specific of command.constraints.specific) {
            let valid: boolean = true;

            if (typeof specific === "string" && (specific.startsWith("@") || specific.startsWith("&"))) {
                switch (specific[0]) {
                    case "@": {
                        if (context.sender.id === specific.substring(1)) {
                            met = true;
                        }

                        break;
                    }

                    case "&": {
                        if (context.msg.member.roles.find("id", specific.substr(1, specific.length))) {
                            met = true;
                        }

                        break;
                    }

                    default: {
                        valid = false;
                    }
                }
            }
            else if (typeof specific === "number" && DiscordRestrictGroup[specific] !== undefined) {
                // Override for bot owner
                if (context.sender.id === context.bot.owner) {
                    met = true;

                    break;
                }

                switch (specific) {
                    case DiscordRestrictGroup.ServerOwner: {
                        const owners: DiscordSnowflake[] = context.msg.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_GUILD")).map((member: GuildMember) => member.id);

                        if (owners.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case DiscordRestrictGroup.ServerModerator: {
                        const moderators: DiscordSnowflake[] = context.msg.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_ROLES")).map((member: GuildMember) => member.id);

                        if (moderators.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case DiscordRestrictGroup.BotOwner: {
                        met = !Util.isEmpty(context.bot.owner) && context.sender.id === context.bot.owner;

                        break;
                    }

                    default: {
                        valid = false;
                    }
                }
            }
            else {
                valid = false;
            }

            if (!valid) {
                throw Log.error(`Invalid restrict group or prefix: ${specific}`);
            }

            if (met) {
                break;
            }
        }

        return met;
    }

    /**
     * @param {DiscordChatEnv} environment
     * @param {string} type
     * @param {boolean} nsfw
     * @return {boolean}
     */
    public static validateChannelTypeEnv(environment: DiscordChatEnv, type: string, nsfw: boolean): boolean {
        if (environment === DiscordChatEnv.Anywhere) {
            return true;
        }
        else if (environment === DiscordChatEnv.Private && type === "dm") {
            return true;
        }
        else if (environment === DiscordChatEnv.NSFW && type === "text") {
            return true;
        }
        else if (environment === DiscordChatEnv.Guild && type === "text") {
            return true;
        }

        return false;
    }

    /**
     * @param {DiscordChatEnv|DiscordChatEnv[]} environment
     * @param {string} channelType
     * @return {boolean}
     */
    public static validateEnv(environment: DiscordChatEnv, channelType: string, nsfw: boolean): boolean {
        if (Array.isArray(environment)) {
            // TODO: CRITICAL: Pointless loop?
            for (const env of environment) {
                if (DiscordCommandHandler.validateChannelTypeEnv(environment, channelType, nsfw)) {
                    return true;
                }
            }
        }
        else {
            return DiscordCommandHandler.validateChannelTypeEnv(environment, channelType, nsfw);
        }

        return false;
    }

    public async handle(context: DiscordContext, command: Command, rawArgs: RawArguments): Promise<boolean> {
        if (!this.meetsRequirements(context, command, rawArgs)) {
            return false;
        }

        return super.handle(context, command, rawArgs);
    }
}
