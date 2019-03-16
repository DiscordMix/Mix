import {Name, Description} from "../../../decorators/general";
import Command from "../../../commands/command";

@Name("test-decorator-command")
@Description("A command for testing decorators")
export default class TestDecoratorCommand extends Command {
    public run(): void {
        //
    }
}
