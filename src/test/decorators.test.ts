import ChatEnv from "../core/chat-env";
import {Constraint, Name, Aliases} from "../decorators/decorators";

@Name("my-command")
@Aliases(["something", "alias-another"])
@Constraint.Cooldown(5000)
@Constraint.Env(ChatEnv.Guild)
@Constraint.Disabled
export class MyCommand {
    public run(): void {
        // ...
    }
}

console.log("--- INSPECT: ", (new MyCommand() as any).constraints);
console.log("--- INSPECT->RUN: ", (new MyCommand() as any).run);
console.log("--- FULL CLASS", new MyCommand());
