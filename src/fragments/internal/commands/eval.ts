import CommandContext from "../../../commands/command-context";
import {Command, Utils} from "../../..";
import FormattedMessage from "../../../builders/formatted-message";
import {TrivialArgType, RestrictGroup, IArgument} from "../../../commands/command";
import EmbedBuilder from "../../../builders/embed-builder";

type EvalArgs = {
    readonly code: string;
    readonly silent: boolean;
}

export default class EvalCommand extends Command<EvalArgs> {
    readonly meta = {
        name: "eval",
        description: "Evaluate code"
    };

    readonly arguments: IArgument[] = [
        {
            name: "code",
            description: "The code to evaluate",
            type: TrivialArgType.String,
            required: true
        },
        {
            name: "silent",
            description: "Send result or not",
            type: TrivialArgType.Boolean,
            required: false
        }
    ];

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext, args: EvalArgs): Promise<void> {
        const code: string = args.code;
        const started: number = Date.now();

        let result: string;
        try {
            result = await eval(code);
        } catch (err) {
            result = err.message;
        }

        if (args.silent) {
            return;
        }

        const embed: EmbedBuilder = new EmbedBuilder();
        embed.footer(`Evaluated in ${(Date.now() - started)}ms`);
        embed.field(`Input`, new FormattedMessage().codeBlock(code, "js").build());
        embed.field(`Output`,
            new FormattedMessage().codeBlock(Utils.escapeText(result.toString().trim() === '' || !result ? 'No return value.' : result.toString(), context.bot.client.token), "js").build()
        );
        embed.color('#36393f');

        context.send(embed.build());
    }
};
