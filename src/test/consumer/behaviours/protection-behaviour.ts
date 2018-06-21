import { BehaviourOptions } from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {
    DMChannel,
    GroupDMChannel,
    Guild,
    GuildChannel,
    GuildMember,
    Message,
    RichEmbed,
    TextChannel,
    User
} from "discord.js";
import Utils from "../../../core/utils";

const channels = {
    general: "286352649610199052",
    suggestions: "458337067299242004",
    modLog: ""
};

const guildId = "286352649610199052";

interface WarnOptions {
    readonly moderator: User;
    readonly user: User;
    readonly channel: TextChannel | DMChannel | GroupDMChannel;
    readonly reason: string;
}

// TODO: Return type
const warn = (options: WarnOptions): Promise<any> => {
    return Utils.send({
        channel: options.channel,
        user: options.moderator,
        footer: `Warned by ${options.moderator.username}`,
        message: `**${options.user}** warned for ${options.reason}`
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
                    message.reply("Discord server invites are not allowed in this server.");
                }
            }
        });
    }
};

export default behaviour;
