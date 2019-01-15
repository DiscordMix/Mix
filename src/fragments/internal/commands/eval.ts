import EmbedBuilder from "../../../builders/embed-builder";
import MsgBuilder from "../../../builders/msg-builder";
import Command, {Type} from "../../../commands/command";
import Context from "../../../commands/command-context";
import Utils from "../../../core/utils";
import {Name, Description, Arguments} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";

interface IArgs {
    readonly code: string;
    readonly silent: boolean;
}

@Name("eval")
@Description("Evaluate code")
@Arguments(
    {
        name: "code",
        description: "The code to evaluate",
        type: Type.String,
        required: true
    },
    {
        name: "silent",
        description: "Send result or not",
        type: Type.Boolean,
        required: false
    }
)
@Constraint.OwnerOnly
export default class EvalCommand extends Command<IArgs> {
    public async run(x: Context, args: IArgs): Promise<void> {
        const started: number = Date.now();

        let result: string;

        try {
            // tslint:disable-next-line:no-eval
            result = await eval(args.code);
        } catch (err) {
            // TODO: Should prefix with 'Error: '?
            result = err.message;
        }

        if (args.silent) {
            return;
        }

        const embed: EmbedBuilder = new EmbedBuilder();

        embed.footer(`Evaluated in ${(Date.now() - started)}ms`);

        embed.field(`Input`, new MsgBuilder()
            .block("js")
            .append(args.code)
            .block()
            .build());

        embed.field(`Output`,
            new MsgBuilder()
                .block("js")
                .append(Utils.escapeText(result.toString().trim() === "" || !result ? "No return value." : result.toString(), x.bot.client.token))
                .block()
                .build()
        );

        embed.color("#36393f");

        x.send(embed.build());
    }
}
