import { CommandContext, Command } from "../../..";

export default class Ping extends Command {
    readonly meta = {
        name: "ping",
        description: "View the latency and heartbeat of the bot"
    };

    public executed(context: CommandContext): void {
        context.ok(`:ping_pong: Pong! ${Math.round(context.bot.client.ping)}ms`); // TODO: Missing heartbeat
    }
}