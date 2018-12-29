import Command from "../../../commands/command";
import {RestrictGroup} from "../../..";
import Context from "../../../commands/command-context";


/**
 * @extends Command
 */
export default class RestartCommand extends Command {
    readonly meta = {
        name: "restart",
        description: "Restart the bot"
    };

    readonly constraints: any = {
        cooldown: 5,
        specific: [RestrictGroup.BotOwner]
    };

    public async run(context: Context): Promise<void> {
        await context.ok("Restarting the bot");
        await context.bot.restart();
    }
}
