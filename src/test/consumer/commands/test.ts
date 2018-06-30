import {CommandOptions} from "../../../commands/command";
import CommandExecutionContext from "../../../commands/command-execution-context";
import SetupHelper from "../../../core/setup-helper";

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

    executed: async (context: CommandExecutionContext, api: any): Promise<void> => {
        const setup = SetupHelper.fromContext(context, "Setup Test");

        if (setup) {
            const responses = await setup
                .input("What is your favorite color?")
                .input("What is the name of your pet?")
                .question("Do you like doggos?")
                .finish();

            console.log(responses);
        }
    }
};

export default command;
