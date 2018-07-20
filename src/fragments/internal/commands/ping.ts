import { CommandContext, Command } from "../../..";

export default abstract class Ping extends Command {
    readonly meta = {
        name: "ping",
        description: "View the latency and heartbeat of the bot"
    };

    executed(context: CommandContext): void {
        context.ok(`:ping_pong: Pong! ${Math.round(context.bot.client.ping)}ms`); // TODO: Missing heartbeat
    }
}