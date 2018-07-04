import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import Permission from "../../../core/permission";
import Utils from "../../../core/utils";

const command: CommandOptions = {
    meta: {
        name: "info",
        desc: "View information about the server",
        aliases: ["uptime"]
    },

    executed: (context: CommandExecutionContext): void => {
        context.sections({
            Uptime: Utils.timeAgoFromNow(context.bot.client.uptime),
            Members: context.message.guild.memberCount
        });
    },

    restrict: {
        issuerPerms: [Permission.ManageGuild]
    }
};

export default command;
