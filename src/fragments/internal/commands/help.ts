import CommandContext from "../../../commands/command-context";
import {RichEmbed} from "discord.js";
import {IReadonlyCommandMap} from "../../../commands/command-store";
import Command from "../../../commands/command";

/**
 * @extends Command
 */
export default class HelpCommand extends Command {
    readonly meta = {
        name: "help",
        description: "View available commands and their descriptions"
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO: Decorator commands broke it (can't .map through a Map)

        const commandMap: IReadonlyCommandMap = context.bot.commandStore.getAll();
        const commands: Command[] = [];

        for (let [base, command] of commandMap) {
            if (command instanceof Command) {
                commands.push(command);
            }
        }

        const commandsString: string = commands
            .map((command: Command) => `**${command.meta.name}**: ${command.meta.description}`)
            .join("\n");

        if (context.bot.options.dmHelp) {
            await (await context.sender.createDM()).send(new RichEmbed()
                .setColor("GREEN")
                .setDescription(commandsString)).catch(async (error: Error) => {
                    
                if (error.message === "Cannot send messages to this user") {
                    await context.fail("You're not accepting direct messages.");
                }
                else {
                    await context.fail(`I was unable to send you my commands. (${error.message})`);
                }
            });
        }
        else {
            await context.ok(commandsString, "Help - Available Commands");
        }
    }
};
