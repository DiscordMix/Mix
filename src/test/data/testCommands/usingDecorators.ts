import {name, desc} from "../../../decorators/general";
import Command from "../../../commands/command";

@name("test-decorator-command")
@desc("A command for testing decorators")
export default class TestDecoratorCommand extends Command {
    public run(): void {
        //
    }
}
