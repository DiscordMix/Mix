import Context from "../../../commands/command-context";
import Command from "../../../commands/command";

/**
 * @extends Command
 */
export default class PingCommand extends Command {
    readonly meta = {
        name: "ping",
        description: "View the latency and heartbeat of the bot"
    };

    readonly constraints: any = {
        cooldown: 1
    };

    public async run(x: Context): Promise<void> {
        await x.ok(`:ping_pong: Beep Boop! ${Math.round(x.bot.client.ping)}ms`); // TODO: Missing heartbeat
    }
}
