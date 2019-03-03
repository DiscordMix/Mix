import {Command} from "../../Index";
import Component from "../../Decorators/Component";

@Component.command("test-component-command", {
    description: "A test component command"
})
export default class TestComponentCommand extends Command {
    public run(): void {
        //
    }
}
