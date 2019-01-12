import {Command} from "../..";
import {Component} from "../../decorators/decorators";

@Component.Command("test-component-command", {
    description: "A test component command"
})
export default class TestComponentCommand extends Command {
    public run(): void {
        //
    }
}
