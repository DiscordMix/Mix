import Command from "../../commands/command";
import {RestrictGroup} from "../..";
import Context from "../../commands/command-context";

export default class EvalCommand extends Command {
    readonly meta = {
        name: "hi",
        description: "Don't say hi"
    };

    readonly constraints: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public run(context: Context): string {
        // Don't say hi!
        return "don't say hi!";
    }
};
