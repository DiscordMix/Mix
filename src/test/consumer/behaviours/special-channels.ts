import {BehaviourOptions} from "../../../behaviours/behaviour";
import Bot from "../../../core/bot";
import {Message} from "discord.js";
import {ConsumerAPIv2} from "../consumer-api";

const channels = {
    suggestions: "458337067299242004"
};

export default <BehaviourOptions>{
    name: "Special Channels",

    enabled: (bot: Bot, api: ConsumerAPIv2): void => {
        bot.client.on("message", async (message: Message) => {
            if (message.channel.id === channels.suggestions && !message.author.bot) {
                await api.addSuggestion(message.content, message.member);

                if (message.deletable) {
                    await message.delete();
                }
            }
        });
    }
};
