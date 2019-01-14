import {default as Command, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description, Arguments} from "../../../decorators/general";
import {Constraint, MsgBuilder} from "../../..";

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

        const usage: MsgBuilder = new MsgBuilder().block().append(`Usage: ${targetCommand.meta.name}`);

        for (const arg of targetCommand.args) {
            usage.append(" ").append(arg.required ? arg.name : `[${arg.name}]`);
        }

        const dependencies: string = targetCommand.dependsOn.length > 0 ? targetCommand.dependsOn.join() : "None";
        const cooldown: string = targetCommand.constraints.cooldown !== 0 ? `${targetCommand.constraints.cooldown} second(s)` : "None";
        const aliases: string = targetCommand.aliases.length > 0 ? targetCommand.aliases.join() : "None";

        const additional: string[] = [
            !targetCommand.isEnabled ? "Disabled" : "",
            targetCommand.undoable ? "Undoable" : "",
            targetCommand.singleArg ? "Single-argument" : ""
        ];

        usage.line()
            .add(`Name: ${targetCommand.meta.name}`)
            .add(`Description: ${targetCommand.meta.description}`)
            .add(`Aliases: ${aliases}`)
            .add(`Dependencies: ${dependencies}`)
            .add(`Cooldown: ${cooldown}`)
            .add(`Additional notes: ${additional.join()}`)
            .line()
            .add("Argument details:")
            .line();

        for (const arg of targetCommand.args) {
            const def: string = arg.defaultValue ? ` (default: ${arg.defaultValue})` : "";
            const flag: string = arg.switchShortName ? ` {-${arg.switchShortName}}` : "";

            // TODO: Missing argument's type
            usage.add(`${arg.name}${arg.required ? "!" : "?"}${flag}${def} : ${arg.description}`);
        }

        await x.send(usage.block().build());
    }
}
