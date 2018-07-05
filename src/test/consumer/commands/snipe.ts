import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import {Message, RichEmbed} from "discord.js";
import Utils from "../../../core/utils";

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

    executed: (context: CommandExecutionContext, api: any) => {
        const lastDeletedChannelMessage: Message = api.getLastDeletedMessage(context.message.channel.id);

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
            context.fail("No message has been deleted in this channel within the last 30 minutes");
        }
    }
};
