import {BehaviourOptions} from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {GuildMember, Message, RichEmbed, User} from "discord.js";
import Utils from "../../../core/utils";
import Log from "../../../core/log";
import ConsumerAPI from "../consumer-api";

function mute(member: GuildMember): void {
    member.addRole(member.guild.roles.find("name", "Muted"));
}

const channels = {
    general: "286352649610199052",
    suggestions: "458337067299242004",
    modLog: "458794765308395521"
};

const guildId = "286352649610199052";

interface WarnOptions {
    readonly moderator: User;
    readonly user: User;
    readonly channel: any;
    readonly reason: string;
}

// TODO: Return type
const warn = (options: WarnOptions): Promise<any> => {
    return Utils.send({
        channel: options.channel,
        user: options.moderator,
        footer: `Warned by ${options.moderator.username}`,
        message: `<@${options.user.id}> was warned for **${options.reason}**`,
        title: "Warn | Case #0",
        color: "GOLD"
    });
};

const behaviour: BehaviourOptions = {
    name: "Special Channels",

    enabled: (bot: Bot, api: any): void => {
        bot.client.on("message", async (message: Message) => {
            if (message.author.id !== "285578743324606482") {
                if (/https?:\/\/discord\.gg\/[a-zA-Z0-9]+/gi.test(message.content) || /https?:\/\/discordapp\.com\/invite\/[a-zA-Z0-9]+/gi.test(message.content)) {
                    if (message.deletable) {
                        await message.delete();
                    }

                    message.reply("Discord server invites are not allowed in this server.");

                    // TODO: Warn
                }
                else if (message.mentions.members.array().length > 4 || message.mentions.roles.array().length > 4 || message.mentions.users.array().length > 4) {
                    if (message.deletable) {
                        await message.delete();
                    }

                    // Mute the user
                    mute(message.member);

                    message.reply("You have been muted until further notice for mass pinging.");
                }

                // TODO: What about if it has been taken action against?
                // TODO: Something around posting suspected violations giving uncatched missing permissions error
                const suspectedViolation: string = api.isMessageSuspicious(message);

                if (suspectedViolation !== "None") {
                    await api.flagMessage(message, suspectedViolation);
                }

                message.mentions.members.array().map((member: GuildMember) => {
                    if (!member.user.bot && member.id !== message.author.id && member.roles.map((role) => role.id).includes("458827341196427265")) {
                        message.reply("Please refrain from pinging this person under any circumstances. He/she is either a partner or special guest and should not be pinged.");

                        const channel = message.guild.channels.get(channels.modLog);

                        if (channel) {
                            warn({
                                user: message.author,
                                reason: "pinging a partner or special guest",
                                moderator: message.guild.me.user,
                                channel: channel
                            });
                        }
                        else {
                            Log.warn("[ProtectionBehaviour] ModLog channel is either missing or invalid");
                        }
                    }
                });
            }
        });

        // Save deleted messages for snipe command
        bot.client.on("messageDelete", (message: Message) => {
            // TODO: Temporary hotfix
            if (message.content.substr(bot.settings.general.prefix.length) === "snipe") {
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

export default behaviour;
