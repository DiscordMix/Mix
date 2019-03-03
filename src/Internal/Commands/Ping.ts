import Command from "../../commands/Command";
import Context from "../../commands/Context";
import {name, description} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";

@name("ping")
@description("View the latency and heartbeat of the bot")
@Constraint.cooldown(1)
export default class extends Command {
    public async run($: Context): Promise<void> {
        // TODO: Missing heartbeat
        await $.send(`:ping_pong: Beep Boop! ${Math.round($.bot.client.ping)}ms`);
    }
}
