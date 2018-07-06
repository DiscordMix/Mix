import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "emoji",
        desc: "Add an emoji",

        args: {
            name: "!string",
            url: "!string"
        }
    },

    executed: (context: CommandContext): void => {

    }
};
