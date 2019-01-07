import Command, {TrivialArgType, RestrictGroup, IArgument} from "../../../commands/command";
import {ActionType, IAction} from "../../../actions/action";
import {IFragmentMeta, IMessageActionArgs} from "../../..";
import Context from "../../../commands/command-context";
import Service from "../../../services/service";
import MsgBuilder from "../../../builders/msg-builder";

interface Args {
    readonly type: ReflectDataType;
}

enum ReflectDataType {
    Services = "services"
}

export default class ReflectCommand extends Command {
    readonly meta: IFragmentMeta = {
        name: "reflect",
        description: "Access bot's internal state"
    };

    readonly arguments: IArgument[] = [
        {
            name: "type",
            description: "The data to inspect",
            required: true,
            switchShortName: "t",
            type: TrivialArgType.String
        }
    ];

    readonly constraints: any = {
        cooldown: 1,
        specific: [RestrictGroup.BotOwner]
    };

    public run(x: Context, args: Args): IAction<IMessageActionArgs> {
        switch (args.type) {
            case ReflectDataType.Services: {
                let services: string = "";

                for (let [name, service] of x.bot.services.getAll()) {
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