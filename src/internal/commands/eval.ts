import EmbedBuilder from "../../builders/embedBuilder";
import MsgBuilder from "../../builders/msgBuilder";
import Command from "../../commands/command";
import Context from "../../commands/context";
import Util from "../../util/util";
import {name, desc, args} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";
import {type} from "../../commands/type";

type Args = {
    readonly code: string;
    readonly silent: boolean;
}

@name("eval")
@desc("Evaluate code")
@args(
    {
        name: "code",
        description: "The code to evaluate",
        type: type.string,
        required: true
    },
    {
        name: "silent",
        description: "Send result or not",
        type: type.boolean,
        required: false
    }
)
@Constraint.ownerOnly
export default class extends Command<Args> {
    public async run($: Context, arg: Args) {
        const started: number = Date.now();

        let result: string;

        try {
            // tslint:disable-next-line:no-eval
            result = await eval(arg.code);
        } catch (err) {
            // TODO: Should prefix with 'Error: '?
            result = err.message;
        }

        if (arg.silent) {
            return;
        }

        const embed: EmbedBuilder = new EmbedBuilder();

        embed.footer(`Evaluated in ${(Date.now() - started)}ms`);

        embed.field(`Input`, new MsgBuilder()
            .block("js")
            .append(arg.code)
            .block()
            .build());

        embed.field(`Output`,
            new MsgBuilder()
                .block("js")
                .append(Util.escapeText(result.toString().trim() === "" || !result ? "No return value." : result.toString(), $.bot.client.token))
                .block()
                .build()
        );

        embed.color("#36393f");

        $.send(embed.build());
    }
}
