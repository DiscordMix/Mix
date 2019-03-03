import Command from "../../Commands/Command";
import Context from "../../Commands/Context";
import {Name, Description} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";

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
