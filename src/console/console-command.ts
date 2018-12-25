import Log from "../core/log";
import {default as parseArgs, ParsedArgs} from "minimist";

export interface IConsoleCommand {
    readonly base: string;
    readonly arguments: ParsedArgs;
}

export default class ConsoleCommand {
    /**
     * @param {string} consoleCommandString
     * @return {ConsoleCommand}
     */
    public static parse(consoleCommandString: string): IConsoleCommand {
        const split: string[] = consoleCommandString.split(" ");

        Log.info(split.join(" "));

        return {
            base: split[0],
            arguments: parseArgs()
        };
    }
}
