import {exec} from "child_process";
import {name, desc, aliases, args} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";
import {type} from "../../commands/type";
import Command from "../../commands/command";
import Context from "../../commands/context";
import EmbedBuilder from "../../builders/embedBuilder";
import MsgBuilder from "../../builders/msgBuilder";
import Util from "../../util/util";

interface IArgs {
    readonly command: string;
}

@name("cli")
@desc("Access the local machine's CLI")
@aliases("exec", "exe")
@args({
    name: "command",
    description: "The command to execute",
    type: type.string,
    required: true
})
@Constraint.ownerOnly
export default class extends Command<IArgs> {
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
