import Command, {RestrictGroup} from "../../../commands/command";
import BotMessages from "../../../core/messages";

/**
 * @extends Command
 */
export default class ThrowCommand extends Command {
    public readonly meta = {
        name: "throw",
        description: "Throw an error"
    };

    public readonly constraints: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async run(): Promise<void> {
        throw new Error(BotMessages.INTENTIONAL_ERROR);
    }
}
