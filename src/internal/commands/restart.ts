import Command from "../../commands/command";
import Context from "../../commands/command-context";
import {name, description} from "../../decorators/general";
import {Constraint} from "../../decorators/constraints";

@name("restart")
@description("Restart the bot and reload modules")
@Constraint.cooldown(5)
@Constraint.ownerOnly
export default class extends Command {
    public async run($: Context): Promise<void> {
        await $.ok("Restarting the bot");
        await $.bot.restart();
    }
}
