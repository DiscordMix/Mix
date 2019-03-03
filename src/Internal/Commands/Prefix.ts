import Command from "../../Commands/Command";
import Context from "../../Commands/Context";
import {Name, Description} from "../../Decorators/General";
import Log from "../../Core/Log";

@Name("prefix")
@Description("Manage bot prefixes")
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
