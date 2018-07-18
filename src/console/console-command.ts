import Log from '../core/log';

const parseArgs = require("minimist");

export default class ConsoleCommand {
    readonly base: string;
    readonly args: any;

    /**
     * @param {string} base
     * @param {Object} args
     */
    constructor(base: string, args: any) {
        /**
         * @type {string}
         * @readonly
         */
        this.base = base;

        /**
         * @type {Object}
         * @readonly
         */
        this.args = args;
    }

    // TODO
    /**
     * @param {string} consoleCommandString
     * @return {ConsoleCommand}
     */
    static parse(consoleCommandString: string): ConsoleCommand {
        const split = consoleCommandString.split(" ");

        Log.info(split.join(" "));

        return new ConsoleCommand(split[0], parseArgs(split.splice(1, 0).join(" ")));
    }
}
