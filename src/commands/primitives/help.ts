import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "help",
        desc: "View available commands and their descriptions"
    },

    executed: (context: CommandExecutionContext): void => {
        context.ok(context.bot.commands.commands
            .map((command) => `${command.name} => ${command.description ? command.description : "No description provided"}`)
            .join("\n"));
    }
};

export default command;
