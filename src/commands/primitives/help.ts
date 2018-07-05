import {CommandOptions} from "../command";
import CommandContext from "../command-context";

export default <CommandOptions>{
    meta: {
        name: "help",
        desc: "View available commands and their descriptions"
    },

    executed: (context: CommandContext): void => {
        context.ok(context.bot.commands.commands
            .map((command) => `${command.name} => ${command.description || "No description provided"}`)
            .join("\n"), "Help - Available Commands");
    }
};
