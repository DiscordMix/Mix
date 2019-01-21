import Command from "../../commands/command";
import {RestrictGroup} from "../..";
import DiscordContext from "../../commands/command-context";

export default class TestCommand extends Command {
    public readonly meta = {
        name: "hi",
        description: "Don't say hi"
    };

    public readonly constraints: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public run(context: DiscordContext): string {
        // Don't say hi!
        return "don't say hi!";
    }
};
