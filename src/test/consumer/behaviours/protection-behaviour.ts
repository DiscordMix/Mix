import {BehaviourOptions} from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {DMChannel, GroupDMChannel, Message, RichEmbed, TextChannel, User} from "discord.js";
import Utils from "../../../core/utils";
import Log from "../../../core/log";

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

    enabled: (bot: Bot): void => {
        bot.client.on("message", async (message: Message) => {
            if (message.content === "pls teach me" && message.channel.id === channels.general) {
                message.author.send(new RichEmbed().setDescription("Here are some awesome tips to get you started!\n=> If you play games, **make sure to mention what games you play in the #general channel** to get shiny roles!\n=>You can click on people's names to see what games they play!\n=> We do giveaways for Dota 2 and Team Fortress 2, make sure to checkout the #giveaways channel"));
            }
            else if (message.author.id !== "285578743324606482") {
                if (/https?:\/\/discord\.gg\/[a-zA-Z0-9]+/.test(message.content) || /https?:\/\/discordapp\.com\/invite\/[a-zA-Z0-9]+/.test(message.content)) {
                    if (message.deletable) {
                        await message.delete();
                    }

                    message.reply("Discord server invites are not allowed in this server.");
                }
                else if (message.mentions.members.array().length > 4 || message.mentions.roles.array().length > 4 || message.mentions.users.array().length > 4) {
                    if (message.deletable) {
                        await message.delete();
                    }

                    // Mute the user
                    message.member.addRole("446493884130787339"); // Muted role id

                    message.reply("You have been muted until further notice for mass pinging.");
                }

                message.mentions.members.array().map((member) => {
                    if (member.roles.map((role) => role.id).includes("458827341196427265")) {
                        message.reply("Please refrain from pinging this person under any circumstances. He/she is either a partner or special guest and should not be pinged.")

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
    }
};

export default behaviour;
