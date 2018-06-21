import { BehaviourOptions } from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {Message} from "discord.js";
import Utils from "../../../core/utils";

const channels = {
    suggestions: "458337067299242004"
};

const behaviour: BehaviourOptions = {
    name: "Special Channels",

    enabled: (bot: Bot): void => {
        bot.client.on("message", async (message: Message) => {
            if (message.channel.id === channels.suggestions && !message.author.bot) {
                const suggestion: Message = await Utils.send({
                    message: message.content.toString(),
                    user: message.author,
                    footer: `Suggested by ${message.author.username}`,
                    channel: message.channel
                });

                if (message.deletable) {
                    message.delete();
                }

                await suggestion.react("⬆");
                await suggestion.react("⬇");
            }
        });
    }
};

export default behaviour;
