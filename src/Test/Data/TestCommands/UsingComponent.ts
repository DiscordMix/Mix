import Component from "../../../Decorators/Component";
import Command from "../../../Commands/Command";

@Component.command("test-component-command", {
    description: "A test component command"
})
export default class TestComponentCommand extends Command {
    public run(): void {
        //
    }
}
