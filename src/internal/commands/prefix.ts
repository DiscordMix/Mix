import Command from "../../commands/command";
import Context from "../../commands/command-context";
import {name, description} from "../../decorators/general";
import Log from "../../core/log";

@name("prefix")
@description("Manage bot prefixes")
export default class extends Command {
    // TODO: Update
    /* readonly args = {
        prefix: "!string"
    }; */

    public async run($: Context): Promise<void> {
        // TODO: Implement

        throw Log.notImplemented;
    }
}
