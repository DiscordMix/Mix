import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import {exec} from "child_process";

const command: CommandOptions = {
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

    executed: (context: CommandExecutionContext): Promise<void> => {
        return new Promise((resolve) => {
            exec("git pull", (error: any, stdOut: string | Buffer) => {
                if (error) {
                    context.fail(`There was an error while pulling changes. (${error.message})`, false);

                    return;
                }

                context.ok(`Pulling successfully completed. Restarting!\n\`\`\`${stdOut}\`\`\``);

                // TODO: Use resolved path instead
                exec("pm2 delete 0 && npm run build && node dist/test/consumer/consumer.js", (error: any) => {
                    if (error) {
                        context.fail(`There was an error while restarting. (${error.message})`, false);

                        return;
                    }

                    resolve();
                });
            });
        });
    }
};

export default command;
