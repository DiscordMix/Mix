import {exec} from "child_process";
import EmbedBuilder from "../../../builders/embed-builder";
import MsgBuilder from "../../../builders/msg-builder";
import Command, {Type} from "../../../commands/command";
import DiscordContext from "../../../commands/command-context";
import Util from "../../../core/util";
import {Description, Name, Aliases, Arguments} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";

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
    public async run($: DiscordContext, args: IArgs): Promise<void> {
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
