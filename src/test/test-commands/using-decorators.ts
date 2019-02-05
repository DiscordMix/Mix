import {name, description} from "../../decorators/general";
import Command from "../../commands/command";

@name("test-decorator-command")
@description("A command for testing decorators")
export default class TestDecoratorCommand extends Command {
    public run(): void {
        //
    }
}
