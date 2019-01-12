import Command, {RestrictGroup} from "../../../commands/command";
import BotMessages from "../../../core/messages";
import {Name, Description} from "../../../decorators/general";
import {Constraint} from "../../../decorators/constraints";

@Name("throw")
@Description("Throw an error")
@Constraint.Specific([RestrictGroup.BotOwner])
export default class ThrowCommand extends Command {
    public async run(): Promise<void> {
        throw new Error(BotMessages.INTENTIONAL_ERROR);
    }
}
