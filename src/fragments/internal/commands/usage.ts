import {IArgument, default as Command, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import {IDecoratorCommand} from "../../../decorators/decorators";

interface IUsageArgs {
    readonly command: string;
}

/**
 * @extends Command
 */
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

    public async run(context: Context, args: IUsageArgs): Promise<void> {
        const targetCommand: Command | IDecoratorCommand | null = await context.bot.commandStore.get(args.command);

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
