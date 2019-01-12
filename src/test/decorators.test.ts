import {Name, Connect, Guards, Component} from "../decorators/decorators";
import Command, {CommandRunner} from "../commands/command";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Component.Command("mycmd", {
    description: "Simple description"
})
export class MyCommand extends Command {
    public run(): void {
        // ...
    }
}

const instance = new (MyCommand as any)(null as any);

console.log("--- INSPECT:", instance);
