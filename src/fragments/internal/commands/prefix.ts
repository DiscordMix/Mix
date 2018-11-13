import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";

/**
 * @extends Command
 */
export default class PrefixCommand extends Command {
    readonly meta = {
        name: "prefix",
        description: "Manage bot prefixes"
    };

    // TODO: Update
    readonly args = {
        prefix: "!string"
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO:
        await context.ok("Command not yet implemented.");
    }
};
