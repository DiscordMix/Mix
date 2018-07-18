import {CommandOptions} from "../command";
import CommandContext from "../command-context";

export default <CommandOptions>{
    meta: {
        name: "prefix",
        desc: "Manage bot prefixes",

        args: {
            prefix: "!string"
        }
    },

    executed: (context: CommandContext): void => {
        // TODO
    }
};
