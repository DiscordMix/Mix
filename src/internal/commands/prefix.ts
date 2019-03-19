import Command from "../../commands/command";
import Context from "../../commands/context";
import {name, desc} from "../../decorators/general";
import Log from "../../core/log";

@name("prefix")
@desc("Manage bot prefixes")
export default class extends Command {
    // TODO: Update.
    /* readonly args = {
        prefix: "!string"
    }; */

    public async run($: Context): Promise<void> {
        // TODO: Implement.

        throw Log.notImplemented;
    }
}
