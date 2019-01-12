import {IFragmentMeta, IMessageActionArgs, Service} from "../../..";
import {ActionType, IAction} from "../../../actions/action";
import MsgBuilder from "../../../builders/msg-builder";
import Command, {IArgument, RestrictGroup, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import {Name, Description, Arguments, Constraint} from "../../../decorators/decorators";

interface IArgs {
    readonly type: ReflectDataType;
}

enum ReflectDataType {
    Services = "services"
}

@Name("reflect")
@Description("Access the bot's internal state")
@Arguments(
    {
        name: "type",
        description: "The data to inspect",
        required: true,
        switchShortName: "t",
        type: TrivialArgType.String
    }
)
@Constraint.Cooldown(1)
@Constraint.Specific([RestrictGroup.BotOwner])
export default class ReflectCommand extends Command {
    public run(x: Context, args: IArgs): IAction<IMessageActionArgs> {
        switch (args.type) {
            case ReflectDataType.Services: {
                let services: string = "";

                for (const [name, service] of x.bot.services.getAll()) {
                    if (service instanceof Service) {
                        services += `${service.running ? "+" : "-"} ${service.meta.name}\n\t${service.meta.description}\n`;
                    }
                }

                const result: string = new MsgBuilder()
                    .block("diff")
                    .append(services)
                    .block()
                    .build();

                return {
                    type: ActionType.Message,

                    args: {
                        channelId: x.c.id,
                        message: result
                    }
                };
            }

            default: {
                return {
                    type: ActionType.Message,

                    args: {
                        channelId: x.c.id,
                        message: "Invalid type provided"
                    }
                };
            }
        }
    }
}
