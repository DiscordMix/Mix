import Command from "../../commands/command";
import BotMessages from "../../core/messages";
import {name, description} from "../../decorators/general";
import {Constraint} from "../../decorators/constraints";
import Log from "../../core/log";

@name("throw")
@description("Throw an error")
@Constraint.ownerOnly
export default class extends Command {
    public async run(): Promise<void> {
        throw Log.error(BotMessages.INTENTIONAL_ERROR);
    }
}
