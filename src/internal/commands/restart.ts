import Command from "../../commands/command";
import Context from "../../commands/command-context";
import {Name, Description} from "../../decorators/general";
import {Constraint} from "../../decorators/constraints";

@Name("restart")
@Description("Restart the bot and reload modules")
@Constraint.Cooldown(5)
@Constraint.OwnerOnly
export default class extends Command {
    public async run($: Context): Promise<void> {
        await $.ok("Restarting the bot");
        await $.bot.restart();
    }
}
