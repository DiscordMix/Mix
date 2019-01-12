import {default as Command, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description, Arguments} from "../../../decorators/general";
import Log from "../../../core/log";

interface IArgs {
    readonly command: string;
}

@Name("usage")
@Description("View the usage of a command")
@Arguments(
    {
        name: "command",
        type: TrivialArgType.String,
        required: true,
        description: "The command to inspect"
    }
)
export default class UsageCommand extends Command<IArgs> {
    // TODO: Finish implementing
    public async run(x: Context, args: IArgs): Promise<void> {
        const targetCommand: Command | null = await x.bot.commandStore.get(args.command);

        if (!targetCommand) {
            x.fail("That command doesn't exist.");

            return;
        }
        else if ((targetCommand as any).type !== undefined) {
            throw Log.notImplemented;
        }

        throw Log.notImplemented;

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
}
