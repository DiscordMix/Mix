import Command, {RestrictGroup} from "../../../commands/command";
import BotMessages from "../../../core/messages";
import {Name, Description, Constraint} from "../../../decorators/decorators";

@Name("throw")
@Description("Throw an error")
@Constraint.Specific([RestrictGroup.BotOwner])
export default class ThrowCommand extends Command {
    public async run(): Promise<void> {
        throw new Error(BotMessages.INTENTIONAL_ERROR);
    }
}
