import Command from "../../../commands/command";
import DiscordContext from "../../../commands/command-context";
import {Name, Description} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";

@Name("ping")
@Description("View the latency and heartbeat of the bot")
@Constraint.Cooldown(1)
export default class PingCommand extends Command {
    public async run($: DiscordContext): Promise<void> {
        // TODO: Missing heartbeat
        await $.ok(`:ping_pong: Beep Boop! ${Math.round($.bot.client.ping)}ms`);
    }
}
