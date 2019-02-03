import {exec} from "child_process";
import {Name, Description, Aliases, Arguments} from "../../decorators/general";
import {Constraint} from "../../decorators/constraints";
import {Type} from "../../commands/type";
import Command from "../../commands/command";
import Context from "../../commands/command-context";
import EmbedBuilder from "../../builders/embed-builder";
import MsgBuilder from "../../builders/msg-builder";
import Util from "../../core/util";

interface IArgs {
    readonly command: string;
}

@Name("cli")
@Description("Access the local machine's CLI")
@Aliases("exec", "exe")
@Arguments(
    {
        name: "command",
        description: "The command to execute",
        type: Type.String,
        required: true
    }
)
@Constraint.OwnerOnly
export default class CliCommand extends Command<IArgs> {
    public async run($: Context, args: IArgs): Promise<void> {
        const started: number = Date.now();

        // TODO: Consider returning a promise?
        exec(args.command, (error, stdout: string, stderror: string) => {
            let result: string = stdout || stderror;

            result = stdout.toString().trim() === "" || !result ? stderror.toString().trim() === "" || !stderror ? "No output" : stderror : result.toString();

            const embed: EmbedBuilder = new EmbedBuilder();

            embed.footer(`Evaluated in ${(Date.now() - started)}ms`);

            embed.field(`Input`, new MsgBuilder()
                .block("js")
                .append(args.command)
                .block()
                .build());

            embed.field("Output",
                new MsgBuilder()
                    .block("js")
                    .append(Util.escapeText(result, $.bot.client.token))
                    .block()
                    .build()
            );

            embed.color("#36393f");

            $.send(embed.build());
        });
    }
}
