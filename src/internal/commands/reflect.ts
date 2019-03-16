import Command from "../../commands/command";
import Context from "../../commands/context";
import {Name, Description, Args} from "../../decorators/general";
import {Constraint} from "../../decorators/constraint";
import {Type} from "../../commands/type";
import {NotImplemented} from "../../decorators/other";

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
