import {Log} from "../../..";
import Command from "../../../commands/command";
import DiscordContext from "../../../commands/command-context";
import {Name, Description} from "../../../decorators/general";

@Name("prefix")
@Description("Manage bot prefixes")
export default class PrefixCommand extends Command {
    // TODO: Update
    /* readonly args = {
        prefix: "!string"
    }; */

    public async run($: DiscordContext): Promise<void> {
        // TODO: Implement

        throw Log.notImplemented;
    }
};
