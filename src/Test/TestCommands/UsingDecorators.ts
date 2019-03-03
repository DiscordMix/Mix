import {Name, Description} from "../../Decorators/General";
import Command from "../../Commands/Command";

@Name("test-decorator-command")
@Description("A command for testing decorators")
export default class TestDecoratorCommand extends Command {
    public run(): void {
        //
    }
}
