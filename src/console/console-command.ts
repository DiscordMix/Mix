import {default as parseArgs, ParsedArgs} from "minimist";
import Log from "../logging/log";

export interface IConsoleCommand {
    readonly base: string;
    readonly arguments: ParsedArgs;
}

export default abstract class ConsoleCommand {
    /**
     * @param {string} consoleCommandString
     * @return {ConsoleCommand}
     */
    public static parse(consoleCommandString: string): IConsoleCommand {
        const split: string[] = consoleCommandString.split(" ");

        Log.info(split.join(" "));

        return {
            arguments: parseArgs(),
            base: split[0]
        };
    }
}
