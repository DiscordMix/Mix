import Command from "../../commands/command";
import Context from "../../commands/context";
import {name, desc, args} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";
import {type} from "../../commands/type";
import {notImplemented} from "../../decorators/other";

interface IArgs {
    readonly type: ReflectDataType;
}

enum ReflectDataType {
    Services = "services"
}

@name("reflect")
@desc("Access the bot's internal state")
@args({
    name: "type",
    description: "The data to inspect",
    required: true,
    flagShortName: "t",
    type: type.string
})
@Constraint.cooldown(1)
@Constraint.ownerOnly
@notImplemented()
export default class extends Command {
    public run($: Context, args: IArgs) {
        // TODO: Require re-write.
    }
}
