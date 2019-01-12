import {RestrictGroup} from "../../..";
import Command from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description, Constraint} from "../../../decorators/decorators";

@Name("restart")
@Description("Restart the bot and reload modules")
@Constraint.Cooldown(5)
@Constraint.Specific([RestrictGroup.BotOwner])
export default class RestartCommand extends Command {
    public async run(x: Context): Promise<void> {
        await x.ok("Restarting the bot");
        await x.bot.restart();
    }
}
