import EmbedBuilder from "../../../builders/embed-builder";
import MsgBuilder from "../../../builders/msg-builder";
import Command, {IArgument, RestrictGroup, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import Utils from "../../../core/utils";

interface IArgs {
    readonly code: string;
    readonly silent: boolean;
}

/**
 * @extends Command
 */
export default class EvalCommand extends Command<IArgs> {
    public readonly meta = {
        name: "eval",
        description: "Evaluate code"
    };

    public readonly args: IArgument[] = [
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

    public readonly constraints: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async run(x: Context, args: IArgs): Promise<void> {
        const started: number = Date.now();

        let result: string;

        try {
            result = await eval(args.code);
        } catch (err) {
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
                .append(Utils.escapeText(result.toString().trim() === '' || !result ? 'No return value.' : result.toString(), x.bot.client.token))
                .block()
                .build()
        );

        embed.color("#36393f");

        x.send(embed.build());
    }
};
