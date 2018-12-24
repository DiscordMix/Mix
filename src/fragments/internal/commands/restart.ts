import Command from "../../../commands/command";
import {RestrictGroup} from "../../..";
import CommandContext from "../../../commands/command-context";


/**
 * @extends Command
 */
export default class RestartCommand extends Command {
    readonly meta = {
        name: "restart",
        description: "Restart the bot"
    };

    readonly restrict: any = {
        cooldown: 5,
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext): Promise<void> {
        await context.ok("Restarting the bot");
        await context.bot.restart();
    }
}
