import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

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
        specific: ["@285578743324606482"]
    }
};

export default command;
