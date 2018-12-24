import CommandContext from "../../../commands/command-context";
import {exec} from "child_process";
import FormattedMessage from "../../../builders/formatted-message";
import Command, {TrivialArgType, RestrictGroup, IArgument} from "../../../commands/command";
import EmbedBuilder from "../../../builders/embed-builder";
import Utils from "../../../core/utils";

type CliArgs = {
    readonly command: string;
}

/**
 * @extends Command
 */
export default class CliCommand extends Command<CliArgs> {
    readonly meta = {
        name: "cli",
        description: "Access the local machine's CLI"
    };

    readonly aliases = ["exec", "exe"];

    readonly arguments: IArgument[] = [
        {
            name: "command",
            description: "The command to execute",
            type: TrivialArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext, args: CliArgs): Promise<void> {
        const started: number = Date.now();

        exec(args.command, (error, stdout: string, stderror: string) => {
            let result: string = stdout || stderror;

            result = stdout.toString().trim() === '' || !result ? stderror.toString().trim() === '' || !stderror ? 'No return value.' : stderror : result.toString();

            const embed: EmbedBuilder = new EmbedBuilder();

            embed.footer(`Evaluated in ${(Date.now() - started)}ms`);
            embed.field(`Input`, new FormattedMessage().codeBlock(args.command, "js").build());

            embed.field("Output",
                new FormattedMessage().codeBlock(Utils.escapeText(result, context.bot.client.token), "js").build()
            )
            .color("#36393f");

            context.send(embed.build());
        });
    }
};
