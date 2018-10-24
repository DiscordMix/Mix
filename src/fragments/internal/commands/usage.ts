import {IArgument, default as Command, TrivialArgType} from "../../../commands/command";
import CommandContext from "../../../commands/command-context";
import {IDecoratorCommand} from "../../../decorators/decorators";

type IUsageArgs = {
    readonly command: string;
}

export default class UsageCommand extends Command<IUsageArgs> {
    readonly meta = {
        name: "usage",
        description: "View the usage of a command"
    };

    readonly arguments: IArgument[] = [
        {
            name: "command",
            type: TrivialArgType.String,
            required: true,
            description: "The command to inspect"
        }
    ];

    public executed(context: CommandContext, args: IUsageArgs): void {
        const targetCommand: Command | IDecoratorCommand | null = context.bot.commandStore.get(args.command);

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

        let usageArgs: string[] = [targetCommand.meta.name];

        for (let i: number = 0; i < targetCommand.arguments.length; i++) {
            usageArgs.push(targetCommand.arguments[i].required ? targetCommand.arguments[i].name : `[${targetCommand.arguments[i].name}]`);
        }

        context.ok(usageArgs.join(" ")); */
    }
};
