import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "test",
        desc: "Test stuff"
    },

    restrict: {
        specific: [
            "@285578743324606482"
        ],

        cooldown: 5
    },

    executed: (context: CommandExecutionContext, api: any): void => {
        context.ok("Yasss");
    }
};

export default command;
