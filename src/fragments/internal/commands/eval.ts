import Context from "../../../commands/command-context";
import MsgBuilder from "../../../builders/msg-builder";
import Command, {TrivialArgType, RestrictGroup, IArgument} from "../../../commands/command";
import EmbedBuilder from "../../../builders/embed-builder";
import Utils from "../../../core/utils";

type Args = {
    readonly code: string;
    readonly silent: boolean;
}

/**
 * @extends Command
 */
export default class EvalCommand extends Command<Args> {
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

    readonly constraints: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async run(x: Context, args: Args): Promise<void> {
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

        embed.field(`Input`, new MsgBuilder()
            .block("js")
            .add(code)
            .block()
            .build());

        embed.field(`Output`,
            new MsgBuilder()
                .block("js")
                .add(Utils.escapeText(result.toString().trim() === '' || !result ? 'No return value.' : result.toString(), x.bot.client.token))
                .block()
                .build()
        );

        embed.color('#36393f');

        x.send(embed.build());
    }
};
