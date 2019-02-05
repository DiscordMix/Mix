import {Command} from "../..";
import Component from "../../decorators/component";

@Component.command("test-component-command", {
    description: "A test component command"
})
export default class TestComponentCommand extends Command {
    public run(): void {
        //
    }
}
