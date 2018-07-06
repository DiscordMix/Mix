import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "stop",
        desc: "Disconnect the bot",
        aliases: ["disconnect"]
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ]
    },

    executed: async (context: CommandContext): Promise<void> => {
        await context.ok("Disconnecting.");
        await context.bot.disconnect();
        process.exit(0);
    }
};
