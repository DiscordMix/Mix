import {default as Command, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description, Arguments} from "../../../decorators/general";
import {Constraint} from "../../..";

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
@Constraint.Cooldown(1)
export default class UsageCommand extends Command<IArgs> {
    // TODO: Finish implementing
    public async run(x: Context, args: IArgs): Promise<void> {
        const targetCommand: Command | null = await x.bot.commandStore.get(args.command);

        if (!targetCommand) {
            await x.fail("That command doesn't exist.");

            return;
        }
        else if (targetCommand.args.length === 0) {
            await x.fail("That command doesn't accept any arguments.");

            return;
        }

        const usageArgs: string[] = [targetCommand.meta.name];

        for (const arg of targetCommand.args) {
            usageArgs.push(arg.required ? arg.name : `[${arg.name}]`);
        }

        await x.ok(usageArgs.join(" "));
    }
}
