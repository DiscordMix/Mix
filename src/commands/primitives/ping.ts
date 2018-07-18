import {CommandOptions} from "../command";
import CommandContext from "../command-context";

export default <CommandOptions>{
    meta: {
        name: "ping",
        desc: "View the latency and heartbeat of the bot"
    },

    executed: (context: CommandContext): void => {
        context.ok(`:ping_pong: Pong! ${Math.round(context.bot.client.ping)}ms`); // TODO: Missing heartbeat
    }
};
