import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";

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

    executed: (context: CommandContext): void => {
        // TODO
    }
};
