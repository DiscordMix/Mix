import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import Permission from "../../../core/permission";

const command: CommandOptions = {
    meta: {
        name: "info",
        desc: "View information about the server",
        aliases: ["uptime"]
    },

    executed: (context: CommandExecutionContext): void => {
        context.sections({
            Uptime: context.bot.client.uptime,
            Members: context.message.guild.memberCount
        });
    },

    restrict: {
        issuerPerms: [Permission.ManageGuild]
    }
};

export default command;
