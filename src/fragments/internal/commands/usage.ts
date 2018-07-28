import {default as Command, CommandArgument, ArgumentType, PrimitiveArgumentType} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";

export interface IUsageArguments {
    readonly command: string;
}

export default class Usage extends Command {
    readonly meta = {
        name: "usage",
        description: "View the usage of a command"
    };

    readonly arguments: Array<CommandArgument> = [
        {
            name: "command",
            type: PrimitiveArgumentType.String,
            required: true,
            description: "The command to inspect"
        }
    ];

    public executed(context: CommandContext, args: IUsageArguments): void {
        const targetCommand: Command | null = context.bot.commandStore.getByName(args.command);

        if (!targetCommand) {
            context.fail("That command doesn't exist.");

            return;
        }
        else if (targetCommand.arguments.length === 0) {
            context.fail("That command doesn't accept any arguments.");

            return;
        }

        let usageArgs: Array<string> = [targetCommand.meta.name];

        for (let i: number = 0; i < targetCommand.arguments.length; i++) {
            usageArgs.push(targetCommand.arguments[i].required ? targetCommand.arguments[i].name : `[${targetCommand.arguments[i].name}]`);
        }

        context.ok(usageArgs.join(" "));
    }
};
