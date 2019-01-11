import {Log} from "../../..";
import Command from "../../../commands/command";
import Context from "../../../commands/command-context";

/**
 * @extends Command
 */
export default class PrefixCommand extends Command {
    public readonly meta = {
        name: "prefix",
        description: "Manage bot prefixes"
    };

    // TODO: Update
    /* readonly args = {
        prefix: "!string"
    }; */

    public async run(x: Context): Promise<void> {
        // TODO: Implement

        throw Log.notImplemented;
    }
};
