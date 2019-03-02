import Command from "../../commands/Command";
import Context from "../../commands/Context";
import {name, description} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";

@name("restart")
@description("Restart the bot and reload modules")
@Constraint.cooldown(5)
@Constraint.ownerOnly
export default class extends Command {
    public async run($: Context): Promise<void> {
        await $.ok("Restarting the bot");
        await $.bot.reconnect();
    }
}
