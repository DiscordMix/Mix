import {default as Command, CommandOptions} from "../command";
import CommandExecutionContext from "../command-execution-context";

const command: CommandOptions = {
    meta: {
        name: "usage",
        desc: "View how to use a certain command",

        args: {
            command: "!string"
        }
    },

    executed: (context: CommandExecutionContext): void => {
        const targetCommand: Command | null = context.bot.commands.getByName(context.arguments[0]);

        if (!targetCommand) {
            context.fail("That command doesn't exist.");

            return;
        }
        else if (Object.keys(targetCommand.args).length === 0) {
            context.fail("That command doesn't accept any arguments.");

            return;
        }

        const argKeys: Array<string> = Object.keys(targetCommand.args);

        let args: Array<string> = [targetCommand.name];

        for (let i: number = 0; i < argKeys.length; i++) {
            const arg = argKeys[i].replace(":", "");

            args.push(targetCommand.args[argKeys[i]].startsWith("!") ? arg : `[${arg}]`);
        }

        context.ok(args.join(" "));
    }
};

export default command;
