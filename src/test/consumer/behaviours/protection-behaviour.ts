import {BehaviourOptions} from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {Collection, Guild, GuildMember, Message, Snowflake} from "discord.js";
import Log from "../../../core/log";
import ConsumerAPI, {ConsumerAPIv2} from "../consumer-api";
import CommandParser from "../../../commands/command-parser";

function mute(member: GuildMember): void {
    member.addRole(member.guild.roles.find("name", "Muted"));
}

export default <BehaviourOptions>{
    name: "Protection",

    enabled: (bot: Bot, api: ConsumerAPIv2): void => {
        bot.client.on("message", async (message: Message) => {
            if (message.author.id !== bot.owner) {
                if (message.member.roles.has(api.roles.muted) && message.deletable) {
                    await message.delete();
                }
                else if (/https?:\/\/discord\.gg\/[a-zA-Z0-9]+/gi.test(message.content) || /https?:\/\/discordapp\.com\/invite\/[a-zA-Z0-9]+/gi.test(message.content)) {
                    if (message.deletable) {
                        await message.delete();
                    }

                    await message.reply("Discord server invites are not allowed in this server.");

                    // TODO: Warn
                }
                else {
                    const mentions: Collection<Snowflake, GuildMember> = message.mentions.members;

                    if (mentions) {
                        const mentionedUsers: Array<GuildMember> = mentions.array();

                        if (mentionedUsers.length > 4 || mentionedUsers.length > 4 || mentionedUsers.length > 4) {
                            if (message.deletable) {
                                await message.delete();
                            }

                            // Mute the user
                            // TODO: Use/implement in Consumer API v2
                            mute(message.member);

                            const response: Message = <Message>(await message.reply("You have been automatically muted until further notice for mass pinging."));

                            if (response) {
                                response.delete(8000);
                            }
                        }
                    }
                }

                // TODO: What about if it has been taken action against?
                // TODO: Something around posting suspected violations giving uncaught missing permissions error
                const suspectedViolation: string = ConsumerAPIv2.isMessageSuspicious(message);

                if (suspectedViolation !== "None") {
                    await api.flagMessage(message, suspectedViolation);
                }

                if (message && message.mentions && message.mentions.members) {
                    message.mentions.members.array().map(async (member: GuildMember) => {
                        if (!message.author.bot && member.id !== message.author.id && member.roles.map((role) => role.id).includes("458827341196427265")) {
                            const response: Message = <Message>(await message.reply("Please refrain from pinging this person under any circumstances. He/she is either a partner or special guest and should not be pinged."));

                            if (response) {
                                response.delete(8000);
                            }

                            await api.warn({
                                user: message.member,
                                reason: "Pinging a 'Dont Ping' member",
                                moderator: message.guild.me.user,
                                message: message
                            });
                        }
                    });
                }
            }
        });

        // Save deleted messages for snipe command
        bot.client.on("messageDelete", (message: Message) => {
            // TODO: Temporary hotfix
            if (CommandParser.getCommandBase(message.content, bot.settings.general.prefixes) === "snipe") {
                return;
            }

            ConsumerAPI.deletedMessages[message.channel.id] = message;

            // Delete the saved message after 30 minutes
            setTimeout(() => {
                delete ConsumerAPI.deletedMessages[message.channel.id];
            }, 1800000);
        });

        if (bot.autoDeleteCommands) {
            Log.warn("The autoDeleteCommands option is currently incompatible with the snipe command");
        }
    }
};
