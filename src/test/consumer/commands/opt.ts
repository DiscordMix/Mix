import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";

export default <CommandOptions>{
    meta: {
        name: "opt",
        desc: "Configure the bot",
        aliases: ["config", "cfg"],

        args: {
            property: "!string",
            value: "!string"
        }
    },

    executed: (context: CommandExecutionContext): void => {
        // TODO
    }
};
