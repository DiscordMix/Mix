import Command from "../../commands/command";
import Context from "../../commands/context";
import {Name, Description} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";

@Name("restart")
@Description("Restart the bot and reload modules")
@Constraint.cooldown(5)
@Constraint.ownerOnly
export default class extends Command {
    public async run($: Context): Promise<void> {
        await $.ok("Restarting the bot");
        await $.bot.reconnect();
    }
}
