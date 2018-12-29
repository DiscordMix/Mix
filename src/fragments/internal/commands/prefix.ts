import Context from "../../../commands/command-context";
import Command from "../../../commands/command";

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

    public async run(context: Context): Promise<void> {
        // TODO:
        await context.ok("Command not yet implemented.");
    }
};
