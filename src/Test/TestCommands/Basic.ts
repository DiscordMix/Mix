import Command from "../../Commands/Command";
import {RestrictGroup} from "../../Index";
import Context from "../../Commands/Context";

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
