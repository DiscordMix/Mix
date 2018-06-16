import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "hello"
    },

    executed: (context: CommandExecutionContext): void => {
        context.ok("Hello world!");
    }
};

export default command;
