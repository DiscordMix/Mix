import {IFragmentMeta, IMessageActionArgs} from "../../..";
import {ActionType, IAction} from "../../../actions/action";
import MsgBuilder from "../../../builders/msg-builder";
import Command, {IArgument, RestrictGroup, TrivialArgType} from "../../../commands/command";
import Context from "../../../commands/command-context";
import Service from "../../../services/generic-service";

interface Args {
    readonly type: ReflectDataType;
}

enum ReflectDataType {
    Services = "services"
}

export default class ReflectCommand extends Command {
    public readonly meta: IFragmentMeta = {
        name: "reflect",
        description: "Access bot's internal state"
    };

    public readonly args: IArgument[] = [
        {
            name: "type",
            description: "The data to inspect",
            required: true,
            switchShortName: "t",
            type: TrivialArgType.String
        }
    ];

    public readonly constraints: any = {
        cooldown: 1,
        specific: [RestrictGroup.BotOwner]
    };

    public run(x: Context, args: Args): IAction<IMessageActionArgs> {
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
