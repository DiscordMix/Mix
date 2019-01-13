import Command, {CommandRunner, TrivialArgType, RestrictGroup} from "../commands/command";
import {Name, Arguments} from "../decorators/general";
import {AttachedLogger, Guards, Connect, DependsOn, OwnerOnly} from "../decorators/other";
import {Constraint, Permission} from "..";

const testConnection: CommandRunner = (x, args): void => {
    //
};

@Name("mycmd")
@AttachedLogger()
@Arguments(
    {
        name: "name",
        type: TrivialArgType.String
    }
)
@Connect(testConnection)
@Guards("testGuard")
@DependsOn("service-name")
@Constraint.Cooldown(5)
@OwnerOnly
@Constraint.IssuerPermissions(Permission.AddReactions)
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
