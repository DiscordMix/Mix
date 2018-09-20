import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";
import {RichEmbed} from "discord.js";

export default class Help extends Command {
    readonly meta = {
        name: "help",
        description: "View available commands and their descriptions"
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO: Decorator commands broke it (can't .map through a Map)
        /* const commands: string = context.bot.commandStore.getAll()
            .map((command: Command) => `**${command.meta.name}**: ${command.meta.description}`)
            .join("\n");

        if (context.bot.options.dmHelp) {
            await (await context.sender.createDM()).send(new RichEmbed()
                .setColor("GREEN")
                .setDescription(commands)).catch(async (error: Error) => {
                if (error.message === "Cannot send messages to this user") {
                    await context.fail("You're not accepting direct messages.");
                }
                else {
                    await context.fail(`I was unable to send you my commands. (${error.message})`);
                }
            });
        }
        else {
            await context.ok(commands, "Help - Available Commands");
        } */
    }
};
