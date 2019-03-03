import Command from "../../Commands/Command";
import Context from "../../Commands/Context";
import {Name, Description} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";

@Name("ping")
@Description("View the latency and heartbeat of the bot")
@Constraint.cooldown(1)
export default class extends Command {
    public async run($: Context): Promise<void> {
        // TODO: Missing heartbeat
        await $.send(`:ping_pong: Beep Boop! ${Math.round($.bot.client.ping)}ms`);
    }
}
