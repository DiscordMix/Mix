import Context from "../../../commands/command-context";
import {RichEmbed} from "discord.js";
import {ReadonlyCommandMap} from "../../../commands/command-store";
import Command from "../../../commands/command";

/**
 * @extends Command
 */
export default class HelpCommand extends Command {
    readonly meta = {
        name: "help",
        description: "View available commands and their descriptions"
    };

    public async run(x: Context): Promise<void> {
        // TODO: Decorator commands broke it (can't .map through a Map)

        const commandMap: ReadonlyCommandMap = x.bot.commandStore.getAll();
        const commands: Command[] = [];

        for (let [base, command] of commandMap) {
            if (command instanceof Command) {
                commands.push(command);
            }
        }

        const commandsString: string = commands
            .map((command: Command) => `**${command.meta.name}**: ${command.meta.description}`)
            .join("\n");

        if (x.bot.options.dmHelp) {
            await (await x.sender.createDM()).send(new RichEmbed()
                .setColor("GREEN")
                .setDescription(commandsString)).catch(async (error: Error) => {
                    
                if (error.message === "Cannot send messages to this user") {
                    await x.fail("You're not accepting direct messages.");
                }
                else {
                    await x.fail(`I was unable to send you my commands. (${error.message})`);
                }
            });
        }
        else {
            await x.ok(commandsString, "Help - Available Commands");
        }
    }
};
