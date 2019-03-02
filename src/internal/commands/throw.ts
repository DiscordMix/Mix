import Command from "../../commands/Command";
import BotMessages from "../../core/Messages";
import {name, description} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";
import Log from "../../core/Log";

@name("throw")
@description("Throw an error")
@Constraint.ownerOnly
export default class extends Command {
    public async run(): Promise<void> {
        throw Log.error(BotMessages.INTENTIONAL_ERROR);
    }
}
