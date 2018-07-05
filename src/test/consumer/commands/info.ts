import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import Permission from "../../../core/permission";
import Utils from "../../../core/utils";

export default <CommandOptions>{
    meta: {
        name: "info",
        desc: "View information about the server",
        aliases: ["uptime"]
    },

    executed: (context: CommandContext): void => {
        context.sections({
            Uptime: Utils.timeAgoFromNow(context.bot.client.uptime),
            Members: context.message.guild.memberCount
        });
    },

    restrict: {
        issuerPerms: [Permission.ManageGuild]
    }
};
