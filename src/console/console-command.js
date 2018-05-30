import Log from '../core/log';

const parseArgs = require("minimist");

export default class ConsoleCommand {
    /**
     * @param {String} base
     * @param {Object} args
     */
    constructor(base, args) {
        /**
         * @type {String}
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
     * @param {String} consoleCommandString
     * @returns {ConsoleCommand}
     */
    static parse(consoleCommandString) {
        const split = consoleCommandString.split(" ");

        Log.info(split.join(" "));

        return new ConsoleCommand(split[0], parseArgs(split.splice(1, 0).join(" ")));
    }
}
