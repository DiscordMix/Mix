import Command from "../../commands/command";
import Context from "../../commands/context";
import {name, desc} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";

@name("restart")
@desc("Restart the bot and reload modules")
@Constraint.cooldown(5)
@Constraint.ownerOnly
export default class extends Command {
    public async run($: Context) {
        await $.ok("Restarting the bot");
        await $.bot.reconnect();
    }
}
