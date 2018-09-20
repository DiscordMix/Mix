import {Argument, default as Command, PrimitiveArgType} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {DecoratorCommand} from "../../../decorators/decorators";

export interface IUsageArguments {
    readonly command: string;
}

export default class Usage extends Command {
    readonly meta = {
        name: "usage",
        description: "View the usage of a command"
    };

    readonly arguments: Array<Argument> = [
        {
            name: "command",
            type: PrimitiveArgType.String,
            required: true,
            description: "The command to inspect"
        }
    ];

    public executed(context: CommandContext, args: IUsageArguments): void {
        const targetCommand: Command | DecoratorCommand | null = context.bot.commandStore.get(args.command);

        if (!targetCommand) {
            context.fail("That command doesn't exist.");

            return;
        }
        else if ((targetCommand as any).type !== undefined) {

        }
        // TODO: New decorator commands broke it
        /* else if (targetCommand.arguments.length === 0) {
            context.fail("That command doesn't accept any arguments.");

            return;
        }

        let usageArgs: Array<string> = [targetCommand.meta.name];

        for (let i: number = 0; i < targetCommand.arguments.length; i++) {
            usageArgs.push(targetCommand.arguments[i].required ? targetCommand.arguments[i].name : `[${targetCommand.arguments[i].name}]`);
        }

        context.ok(usageArgs.join(" ")); */
    }
};
