import CommandContext from "../../../commands/command-context";
import { Command } from "../../..";

export default abstract class Help extends Command {
    readonly meta = {
        name: "help",
        description: "View available commands and their descriptions"
    };

    executed(context: CommandContext): void {
        context.ok(context.bot.commandStore.commands
            .map((command: Command) => `${command.meta.name} => ${command.meta.description || "No description provided"}`)
            .join("\n"), "Help - Available Commands");
    }
};
