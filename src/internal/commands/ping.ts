import Command from "../../commands/command";
import Context from "../../commands/context";
import {Name, Description} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";

@Name("ping")
@Description("View the latency and heartbeat of the bot")
@Constraint.cooldown(1)
export default class extends Command {
    public async run($: Context): Promise<void> {
        // TODO: Missing heartbeat.
        await $.send(`:ping_pong: Beep Boop! ${Math.round($.bot.client.ping)}ms`);
    }
}
