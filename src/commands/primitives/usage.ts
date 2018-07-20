import {default as Command} from "../command";
import CommandContext from "../command-context";

export default abstract class Usage extends Command {
    readonly meta = {
        name: "usage",
        description: "View the usage of a command"
    };

    readonly args = {
        command: "!string"
    };

    executed(context: CommandContext): void {
        const targetCommand: Command | null = context.bot.commandStore.getByName(context.arguments[0]);

        if (!targetCommand) {
            context.fail("That command doesn't exist.");

            return;
        }
        else if (Object.keys(targetCommand.args).length === 0) {
            context.fail("That command doesn't accept any arguments.");

            return;
        }

        const argKeys: Array<string> = Object.keys(targetCommand.args);

        let args: Array<string> = [targetCommand.meta.name];

        for (let i: number = 0; i < argKeys.length; i++) {
            const arg = argKeys[i].replace(":", "");

            args.push(targetCommand.args[argKeys[i]].startsWith("!") ? arg : `[${arg}]`);
        }

        context.ok(args.join(" "));
    }
};
