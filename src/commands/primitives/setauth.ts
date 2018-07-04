import {CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "setauth",
        desc: "Manage authentication levels",

        args: {
            user: "!:member"
        }
    },

    restrict: {
        auth: -1 // Owner
    },

    executed: (context: CommandExecutionContext): void => {
        // TODO
    }
};

export default command;
