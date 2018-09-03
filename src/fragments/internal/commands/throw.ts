import CommandContext from "../../../commands/command-context";
import {Command} from "../../..";

export default class Throw extends Command {
    readonly meta = {
        name: "throw",
        description: "Throw an error"
    };

    constructor() {
        super();

        // Owner only
        this.restrict.auth = -1;
    }

    public async executed(context: CommandContext): Promise<void> {
        throw new Error("Intentionally thrown error");
    }
};
