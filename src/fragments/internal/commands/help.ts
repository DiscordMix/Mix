import CommandContext from "../../../commands/command-context";
import { Command } from "../../..";

export default abstract class Help extends Command {
    readonly meta = {
        name: "help",
        description: "View available commands and their descriptions"
    };

    public async executed(context: CommandContext): Promise<void> {
        console.log("c", context.bot.commandStore.commands);

        await context.ok(context.bot.commandStore.commands
            .map((command: Command) => `**${command.meta.name}**: ${command.meta.description}`)
            .join("\n"), "Help - Available Commands");
    }
};
