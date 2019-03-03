import Command from "../../commands/Command";
import Context from "../../commands/Context";
import {name, description, args} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";
import {Type} from "../../commands/Type";
import {notImplemented} from "../../Decorators/Other";

interface IArgs {
    readonly type: ReflectDataType;
}

enum ReflectDataType {
    Services = "services"
}

@name("reflect")
@description("Access the bot's internal state")
@args(
    {
        name: "type",
        description: "The data to inspect",
        required: true,
        flagShortName: "t",
        type: Type.string
    }
)
@Constraint.cooldown(1)
@Constraint.ownerOnly
@notImplemented()
export default class extends Command {
    public run($: Context, args: IArgs) {
        // TODO: Require re-write.
    }
}
