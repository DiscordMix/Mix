import {default as parseArgs, ParsedArgs} from "minimist";
import Log from "../Core/Log";

export interface IConsoleCommand {
    readonly base: string;
    readonly arguments: ParsedArgs;
}

export default abstract class ConsoleCommand {
    public static parse(consoleCommandString: string): IConsoleCommand {
        const split: string[] = consoleCommandString.split(" ");

        Log.info(split.join(" "));

        return {
            arguments: parseArgs(),
            base: split[0]
        };
    }
}
