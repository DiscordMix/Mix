import CommandContext from "../../../commands/command-context";
import { Command } from "../../..";

export default class Prefix extends Command {
    readonly meta = {
        name: "prefix",
        description: "Manage bot prefixes"
    };

    readonly args = {
        prefix: "!string"
    };

    public async executed(context: CommandContext): Promise<void> {
        // TODO
        await context.ok("Command not yet implemented.");
    }
};
