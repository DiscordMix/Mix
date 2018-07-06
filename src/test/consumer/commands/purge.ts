import {CommandOptions} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";

export default <CommandOptions>{
    meta: {
        name: "purge",
        desc: "Delete messages in bulk",

        args: {
            amount: "!number"
        }
    },

    // TODO: Return type, should be void
    executed: async (context: CommandContext): Promise<any> => {
        return new Promise((resolve) => {
            if (context.arguments[0] < 1) {
                context.fail("Amount must be 1 or higher.");
                resolve();

                return;
            }

            // TODO: Fix incompatibility with autoDeleteCommand? Something's wrong
            context.message.channel.bulkDelete(context.arguments[0]).then(() => {
                resolve();
            }).catch((error: Error) => {
                context.fail(`Operation failed. (${error.message})`, false);

                resolve();
            });
        });
    },

    restrict: {
        specific: [
            "@285578743324606482" // Owner
        ]
    }
};
