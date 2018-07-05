import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

export default <CommandOptions>{
    meta: {
        name: "roleall",
        desc: "Add a role to all members",

        args: {
            role: "!string"
        }
    },

    executed: (context: CommandExecutionContext): void => {
        // TODO
    }
};
