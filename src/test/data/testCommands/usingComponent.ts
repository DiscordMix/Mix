import Component from "../../../decorators/Component";
import Command from "../../../commands/command";

@Component.command("test-component-command", {
    description: "A test component command"
})
export default class TestComponentCommand extends Command {
    public run(): void {
        //
    }
}
