import {ChatEnvironment} from "../core/chat-environment";
import {CommandOptions} from "./command-options";
import Permission from "../core/permission";

const Typer = require("@raxor1234/typer/typer");

export default class Command {
    readonly name: string;
    readonly description: string;
    readonly aliases: Array<string>;
    readonly executed: Function;
    readonly canExecute: Function | boolean;
    readonly args: any;
    readonly isEnabled: boolean;
    readonly cooldown: number;
    readonly permissions: Array<Permission>;
    readonly environment: ChatEnvironment;
    readonly auth: number;

    /**
     * @param {Object} options
     */
    constructor(options: CommandOptions) {
        /**
         * @type {String}
         * @readonly
         */
        this.name = options.meta.name;

        /**
         * @type {String}
         * @readonly
         */
        this.description = options.meta.desc ? options.meta.desc : "No description provided";

        /**
         * @type {Array<String>}
         * @readonly
         */
        this.aliases = options.meta.aliases ? options.meta.aliases : [];

        /**
         * @type {Function}
         * @readonly
         */
        this.executed = options.executed;

        /**
         * @type {Function}
         * @readonly
         */
        this.canExecute = options.canExecute ? options.canExecute : true;

        /**
         * @type {Object}
         * @readonly
         */
        this.args = options.meta.args ? options.meta.args : {};

        /**
         * @type {Boolean}
         * @readonly
         */
        this.isEnabled = options.restrict.enabled !== undefined ? options.restrict.enabled : true;

        /**
         * @type {Number}
         * @readonly
         */
        this.cooldown = options.restrict.cooldown ? options.restrict.cooldown : 0;

        /**
         * @type {Array<Number>}
         */
        this.permissions = options.restrict.permissions ? options.restrict.permissions : [];

        /**
         * @type {ChatEnvironment|Array<ChatEnvironment>}
         * @readonly
         */
        this.environment = options.restrict.env !== undefined ? options.restrict.env : ChatEnvironment.Anywhere;

        // TODO: Default auth level to 'default'
        /**
         * @type {Number}
         * @readonly
         */
        this.auth = options.restrict.auth !== undefined ? options.restrict.auth : 0;
    }

    /**
     * @return {Number} The minimum amount of required arguments that this command accepts
     */
    get maxArguments(): number {
        const keys = Object.keys(this.args);

        let counter = 0;

        for (let i = 0; i < keys.length; i++) {
            if (this.args[keys[i]].startsWith("!")) {
                counter++;
            }
        }

        return counter;
    }

    /**
     * Validate a command module
     * @param {Object} data The module to validate
     * @return {Boolean} Whether the module is valid
     */
    static validate(data: CommandOptions): boolean {
        const methods = Typer.validate({
            executed: "!function",
            meta: "!object",
            canExecute: "function",
            restrict: "object"
        }, data);

        const meta = Typer.validate({
            name: "!string",
            desc: "string",
            args: "object",
            aliases: ":array",
            isEnabled: "boolean",
        }, data.meta, {
            array: (val: any) => val instanceof Array
        });

        const restrict = Typer.validate({
            auth: "number",
            permissions: ":array",
            env: "number"
        }, data.restrict, {
            array: (val: any) => val instanceof Array
        });

        return (methods && meta && restrict);
    }
}
