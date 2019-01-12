import Command, {CommandRunner} from "../commands/command";
import {Name} from "../decorators/general";
import {AttachedLogger} from "../decorators/other";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@AttachedLogger()
export class MyCommand extends Command {
    public run(): void {
        // ...
    }
}

const instance = new (MyCommand as any)(null as any);

console.log("--- INSPECT:", instance);
