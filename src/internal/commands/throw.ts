import Command from "../../commands/command";
import BotMessages from "../../core/Messages";
import {name, description} from "../../decorators/general";
import {Constraint} from "../../decorators/Constraint";
import Log from "../../core/log";

@name("throw")
@description("Throw an error")
@Constraint.ownerOnly
export default class extends Command {
    public async run(): Promise<void> {
        throw Log.error(BotMessages.INTENTIONAL_ERROR);
    }
}
