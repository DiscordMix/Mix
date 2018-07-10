import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {Message, RichEmbed} from "discord.js";
import Utils from "../../../core/utils";
import {ConsumerAPIv2} from "../consumer-api";

export default <CommandOptions>{
    meta: {
        name: "snipe",
        desc: "View the last deleted message in this channel"
    },

    restrict: {
        specific: [
            "@285578743324606482", // Owner
            "&458130451572457483", // Trial mods
            "&458130847510429720", // Mods
            "&458812900661002260"  // Assistants
        ]
    },

    executed: async (context: CommandContext, api: ConsumerAPIv2): Promise<void> => {
        const lastDeletedChannelMessage: Message | null = api.getLastDeletedMessage(context.message.channel.id);

        if (lastDeletedChannelMessage) {
            const embed = lastDeletedChannelMessage.content.length === 0 && lastDeletedChannelMessage.embeds.length > 0;

            context.message.channel.send(new RichEmbed()
                .addField("Message", embed ? "*Embedded Message*" : lastDeletedChannelMessage.content)
                .addField("Author", `<@${lastDeletedChannelMessage.author.id}> (${lastDeletedChannelMessage.author.tag})`)
                .addField("Time", Utils.timeAgo(lastDeletedChannelMessage.createdTimestamp))
                .addField("Message ID", lastDeletedChannelMessage.id)
                .setColor("GREEN"));
        }
        else {
            await context.fail("No message has been deleted in this channel within the last 30 minutes.");
        }
    }
};
