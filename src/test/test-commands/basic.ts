import Command from "../../commands/command";
import {RestrictGroup} from "../..";
import Context from "../../commands/command-context";

export default class extends Command {
    public readonly meta = {
        name: "hi",
        description: "Don't say hi"
    };

    public readonly constraints: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public run($: Context): string {
        // Don't say hi!
        return "don't say hi!";
    }
}
