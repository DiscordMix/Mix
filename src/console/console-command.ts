import Log from "../core/log";
import {default as parseArgs} from "minimist";

export default class ConsoleCommand {
    public readonly base: string;
    public readonly args: any;

    /**
     * @param {string} base
     * @param {*} args
     */
    public constructor(base: string, args: any) {
        /**
         * @type {string}
         * @readonly
         */
        this.base = base;

        /**
         * @type {*}
         * @readonly
         */
        this.args = args;
    }

    // TODO:
    /**
     * @param {string} consoleCommandString
     * @return {ConsoleCommand}
     */
    public static parse(consoleCommandString: string): ConsoleCommand {
        const split: string[] = consoleCommandString.split(" ");

        Log.info(split.join(" "));

        return new ConsoleCommand(split[0], parseArgs(split.splice(1, 0).join(" ")));
    }
}
