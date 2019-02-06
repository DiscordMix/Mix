import {default as Command} from "../../commands/command";
import Context from "../../commands/context";
import {name, description, args} from "../../decorators/general";
import MsgBuilder from "../../builders/msg-builder";
import {Constraint} from "../../decorators/constraints";
import {Type} from "../../commands/type";

interface IArgs {
    readonly command: string;
}

const delimiter: string = ", ";

@name("usage")
@description("View the usage of a command")
@args(
    {
        name: "command",
        type: Type.string,
        required: true,
        description: "The command to inspect"
    }
)
@Constraint.cooldown(1)
export default class extends Command<IArgs> {
    // TODO: Finish implementing
    public async run($: Context, args: IArgs): Promise<void> {
        const targetCommand: Command | null = await $.bot.registry.get(args.command);

        if (!targetCommand) {
            await $.fail("That command doesn't exist.");

            return;
        }

        const usage: MsgBuilder = new MsgBuilder().block().append(`# Usage\n${targetCommand.meta.name}`);

        for (const arg of targetCommand.args) {
            usage.append(" ").append(arg.required ? arg.name : `[${arg.name}]`);
        }

        const dependencies: string = targetCommand.dependsOn.length > 0 ? targetCommand.dependsOn.join(delimiter) : "None";
        const cooldown: string = targetCommand.constraints.cooldown !== 0 ? `${targetCommand.constraints.cooldown} second(s)` : "None";
        const aliases: string = targetCommand.aliases.length > 0 ? targetCommand.aliases.join(delimiter) : "None";

        const additional: string[] = [];

        if (!targetCommand.isEnabled) {
            additional.push("Disabled");
        }

        if (targetCommand.undoable) {
            additional.push("Undo-able");
        }

        if (targetCommand.singleArg) {
            additional.push("Single-argument");
        }

        usage.line()
            .add(`# Name\n${targetCommand.meta.name}`)
            .line()
            .add(`# Description\n${targetCommand.meta.description}`)
            .line()
            .add(`# Aliases\n${aliases}`)
            .line()
            .add(`# Dependencies\n${dependencies}`)
            .line()
            .add(`# Cooldown\n${cooldown}`)
            .line()
            .add(`# Additional notes\n${additional.join(delimiter)}`);

        if (targetCommand.args.length > 0) {
            usage.line()
                .add("# Argument details\n")
                .line();

            for (const arg of targetCommand.args) {
                const def: string = arg.defaultValue ? ` (default: '${arg.defaultValue}')` : "";
                const flag: string = arg.flagShortName ? ` {-${arg.flagShortName}}` : "";

                // TODO: Missing argument's type
                usage.add(`${arg.name}${arg.required ? "!" : "?"}${flag}${def} : ${arg.description}`);
            }
        }

        await $.send(usage.block().build());
    }
}
