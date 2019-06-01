import {RichEmbed} from "discord.js";
import Command from "../../commands/command";
import Context from "../../commands/context";
import {ReadonlyCommandMap} from "../../commands/commandRegistry";
import {desc, name} from "../../decorators/general";

@name("help")
@desc("View available commands and their descriptions")
export default class extends Command {
    public async run($: Context) {
        const commandMap: ReadonlyCommandMap = $.bot.registry.getAll();

        // Stop immediatly if no commands exist.
        if (commandMap.size == 0) {
            return $.fail("No commands exist.");
        }

        // Create the command buffer array.
        const commands: Command[] = [];

        // Populate the buffer array from the map.
        for (const [base, command] of commandMap) {
            if (command instanceof Command) {
                commands.push(command);
            }
        }

        // Create the command listing string.
        const commandsString: string = commands
            .map((command: Command) => `**${command.meta.name}**: ${command.meta.description}`)
            .join("\n");

        if ($.bot.options.dmHelp) {
            await (await $.sender.createDM()).send(new RichEmbed()
                .setColor("GREEN")
                .setDescription(commandsString)).catch(async (error: Error) => {

                    if (error.message === "Cannot send messages to this user") {
                        await $.fail("You're not accepting direct messages.");
                    }
                    else {
                        await $.fail(`I was unable to send you my commands. (${error.message})`);
                    }
                });
        }
        else {
            await $.pass(commandsString, "Help - Available Commands");
        }
    }
}
