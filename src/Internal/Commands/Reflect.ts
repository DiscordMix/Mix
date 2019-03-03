import Command from "../../Commands/Command";
import Context from "../../Commands/Context";
import {Name, Description, Args} from "../../Decorators/General";
import {Constraint} from "../../Decorators/Constraint";
import {Type} from "../../Commands/Type";
import {NotImplemented} from "../../Decorators/Other";

interface IArgs {
    readonly type: ReflectDataType;
}

enum ReflectDataType {
    Services = "services"
}

@Name("reflect")
@Description("Access the bot's internal state")
@Args(
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
@NotImplemented()
export default class extends Command {
    public run($: Context, args: IArgs) {
        // TODO: Require re-write.
    }
}
