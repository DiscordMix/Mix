import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {exec} from "child_process";

export default <CommandOptions>{
    meta: {
        name: "update",
        desc: "Pull changes from the git repository",
        aliases: ["pull"]
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ]
    },

    executed: (context: CommandContext): Promise<void> => {
        return new Promise((resolve) => {
            exec("git pull", async (error: any, stdOut: string | Buffer) => {
                if (error) {
                    context.fail(`There was an error while pulling changes. (${error.message})`, false);

                    return;
                }

                context.ok(`\`\`\`${stdOut}\`\`\``);
                resolve();
            });
        });
    }
};
