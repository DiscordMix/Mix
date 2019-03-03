import Command from "../../Commands/Command";
import BotMessages from "../../Core/Messages";
import {Name, Description} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";
import Log from "../../Core/Log";

@Name("throw")
@Description("Throw an error")
@Constraint.ownerOnly
export default class extends Command {
    public async run(): Promise<void> {
        throw Log.error(BotMessages.INTENTIONAL_ERROR);
    }
}
