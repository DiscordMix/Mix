import Command, {CommandRunner, TrivialArgType} from "../commands/command";
import {Name, Arguments} from "../decorators/general";
import {AttachedLogger, Guards, Connect, DependsOn} from "../decorators/other";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@AttachedLogger()
@Arguments(
    {
        name: "f",
        type: TrivialArgType.String
    }
)
@Connect(testConnection)
@Guards("testGuard")
@DependsOn("service-name")
export class MyCommand extends Command {
    public testGuard(): boolean {
        //

        return false;
    }

    public run(): void {
        // ...
    }
}

const instance = new (MyCommand as any)(null as any);

console.log("--- INSPECT:", instance);
