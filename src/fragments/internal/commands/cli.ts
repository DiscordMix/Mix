import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";
import {exec} from "child_process";
import FormattedMessage from "../../../builders/formatted-message";
import {PrimitiveArgType, RestrictGroup, Argument} from "../../../commands/command";

type CliArgs = {
    readonly command: string;
}

export default class Cli extends Command<CliArgs> {
    readonly meta = {
        name: "cli",
        description: "Access the local machine's CLI"
    };

    readonly aliases = ["exec", "exe"];

    readonly arguments: Argument[] = [
        {
            name: "command",
            description: "The command to execute",
            type: PrimitiveArgType.String,
            required: true
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext, args: CliArgs): Promise<void> {
        exec(args.command, (error, stdout: string, stderror: string) => {
            const message: FormattedMessage = new FormattedMessage()
                .add("Output")
                .line()
                .codeBlock(stdout);

            if (stderror) {
                message
                    .line()
                    .add("Error")
                    .line()
                    .codeBlock(stderror);
            }

            context.ok(message);
        });
    }
};
