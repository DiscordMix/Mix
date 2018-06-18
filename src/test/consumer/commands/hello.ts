import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "hello"
    },

    restrict: {
        auth: 1
    },

    executed: (context: CommandExecutionContext): void => {
        context.ok("Hello world!");
    }
};

export default command;
