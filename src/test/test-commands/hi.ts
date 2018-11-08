import {Command, RestrictGroup, CommandContext} from "../..";

export default class EvalCommand extends Command {
    readonly meta = {
        name: "hi",
        description: "Say hi"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(context: CommandContext): Promise<void> {
        context.ok("hello world!");
    }
};
