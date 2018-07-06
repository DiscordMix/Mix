import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {exec} from "child_process";

export default <CommandOptions>{
    meta: {
        name: "build",
        desc: "Build the bot"
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ],

        cooldown: 5
    },

    executed: (context: CommandContext): Promise<void> => {
        return new Promise(async (resolve) => {
            await context.ok("Building the project. This may take a while.");

            exec("yarn build", (error: any, stdOut: string) => {
                if (error) {
                    context.fail(`There was an error while building. (${error.message})`, false);
                }

                context.ok(`\`\`\`${stdOut}\`\`\``);
                resolve();
            });
        });
    }
};
