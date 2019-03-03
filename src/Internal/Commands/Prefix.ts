import Command from "../../commands/Command";
import Context from "../../commands/Context";
import {name, description} from "../../Decorators/General";
import Log from "../../Core/Log";

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
