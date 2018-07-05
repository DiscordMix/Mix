import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

export default <CommandOptions>{
    meta: {
        name: "prefix",
        desc: "Manage bot prefixes",

        args: {
            prefix: "!string"
        }
    },

    executed: (context: CommandExecutionContext): void => {
        // TODO
    }
};
