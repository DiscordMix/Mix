import {Command, CommandContext} from "../../..";

export default class Ping extends Command {
    readonly meta = {
        name: "ping",
        description: "View the latency and heartbeat of the bot"
    };

    readonly restrict: any = {
        cooldown: 1
    };

    public async executed(context: CommandContext): Promise<void> {
        await context.ok(`:ping_pong: Pong! ${Math.round(context.bot.client.ping)}ms`); // TODO: Missing heartbeat
    }
}
