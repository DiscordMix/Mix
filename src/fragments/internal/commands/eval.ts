import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";
import FormattedMessage from "../../../builders/formatted-message";
import {PrimitiveArgType, RestrictGroup, Argument} from "../../../commands/command";

type EvalArgs = {
    readonly code: string;
}

export default class Eval extends Command<EvalArgs> {
    readonly meta = {
        name: "eval",
        description: "Evaluate code"
    };

    readonly arguments: Argument[] = [
        {
            name: "code",
            description: "The code to evaluate",
            type: PrimitiveArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext, args: EvalArgs): Promise<void> {
        const output: string = eval(args.code);

        await context.ok(new FormattedMessage()
            .addLine("Output")
            .codeBlock(output));
    }
};
