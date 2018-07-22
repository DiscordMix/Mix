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

    public executed(context: CommandContext): void {
        // TODO
    }
};
