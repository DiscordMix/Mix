import {name, description} from "../../Decorators/General";
import Command from "../../commands/Command";

@name("test-decorator-command")
@description("A command for testing decorators")
export default class TestDecoratorCommand extends Command {
    public run(): void {
        //
    }
}
