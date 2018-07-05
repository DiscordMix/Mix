import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "roleall",
        desc: "Add a role to all members",

        args: {
            role: "!string"
        }
    },

    executed: (context: CommandContext): void => {
        // TODO
    }
};
