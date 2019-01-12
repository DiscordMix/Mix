import Command from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";

@Name("ping")
@Description("View the latency and heartbeat of the bot")
@Constraint.Cooldown(1)
export default class PingCommand extends Command {
    public async run(x: Context): Promise<void> {
        // TODO: Missing heartbeat
        await x.ok(`:ping_pong: Beep Boop! ${Math.round(x.bot.client.ping)}ms`);
    }
}
