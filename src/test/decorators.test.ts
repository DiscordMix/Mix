import {Name, Arguments} from "../decorators/decorators";
import Command, {CommandRunner, TrivialArgType} from "../commands/command";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@Arguments(
    {
        name: "f",
        type: TrivialArgType.String
    }
)
export class MyCommand extends Command {
    public run(): void {
        // ...
    }
}

const instance = new (MyCommand as any)(null as any);

console.log("--- INSPECT:", instance);
