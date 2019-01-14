import Command from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";

@Name("restart")
@Description("Restart the bot and reload modules")
@Constraint.Cooldown(5)
@Constraint.OwnerOnly
export default class RestartCommand extends Command {
    public async run(x: Context): Promise<void> {
        await x.ok("Restarting the bot");
        await x.bot.restart();
    }
}
