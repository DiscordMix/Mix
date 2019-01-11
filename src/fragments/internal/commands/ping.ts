import Command from "../../../commands/command";
import Context from "../../../commands/command-context";

/**
 * @extends Command
 */
export default class PingCommand extends Command {
    public readonly meta = {
        name: "ping",
        description: "View the latency and heartbeat of the bot"
    };

    public readonly constraints: any = {
        cooldown: 1
    };

    public async run(x: Context): Promise<void> {
        // TODO: Missing heartbeat
        await x.ok(`:ping_pong: Beep Boop! ${Math.round(x.bot.client.ping)}ms`);
    }
}
