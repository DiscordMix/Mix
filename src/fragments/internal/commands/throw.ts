import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";
import {RestrictGroup} from "../../../commands/command";

export default class Throw extends Command {
    readonly meta = {
        name: "throw",
        description: "Throw an error"
    };

    readonly restrict: any = {
        specific: [RestrictGroup.BotOwner]
    };

    public async executed(): Promise<void> {
        throw new Error("Intentionally thrown error");
    }
};
