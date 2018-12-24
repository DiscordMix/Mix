import Command from "../../commands/command";
import {RestrictGroup} from "../..";
import CommandContext from "../../commands/command-context";

export default class EvalCommand extends Command {
    readonly meta = {
        name: "hi",
        description: "Don't say hi"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public executed(context: CommandContext): string {
        // Don't say hi!
        return "don't say hi!";
    }
};
