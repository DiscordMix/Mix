import CommandContext from "../command-context";
import { Command } from "../..";

export default abstract class Prefix extends Command {
    readonly meta = {
        name: "prefix",
        description: "Manage bot prefixes"
    };

    readonly args = {
        prefix: "!string"
    };

    executed(context: CommandContext): void {
        // TODO
    }
};
