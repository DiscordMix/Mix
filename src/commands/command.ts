import ChatEnvironment from "../core/chat-environment";

const Typer = require("@raxor1234/typer/typer");

export interface CommandMetaOptions {
    name: string;
    desc: string;
    aliases: Array<string>;
    args: any;
}

export interface CommandRestrictOptions {
    enabled: boolean;
    cooldown: number;
    permissions: Array<any>; // TODO: Permission type
    env: ChatEnvironment;
    auth: number;
    exclude: Array<string>;
}

export interface CommandOptions {
    executed: Function;
    canExecute: Function;
    meta: CommandMetaOptions;
    restrict: CommandRestrictOptions;
}

export default class Command {
    readonly name: string;
    readonly description: string;
    readonly aliases: Array<string>;
    readonly executed: Function;
    readonly canExecute: Function | boolean;
    readonly args: any;
    readonly isEnabled: boolean;
    readonly cooldown: number;
    readonly permissions: Array<any>; // TODO: Type hotfix
    readonly environment: ChatEnvironment;
    readonly auth: number;
    readonly exclude: Array<string>;

    /**
     * @param {Object} options
     */
    constructor(options: CommandOptions) {
        /**
         * @type {string}
         * @readonly
         */
        this.name = options.meta.name;

        /**
         * @type {string}
         * @readonly
         */
        this.description = options.meta.desc ? options.meta.desc : "No description provided";

        /**
         * @type {Array<string>}
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
         * @type {boolean}
         * @readonly
         */
        this.isEnabled = options.restrict.enabled !== undefined ? options.restrict.enabled : true;

        /**
         * @type {number}
         * @readonly
         */
        this.cooldown = options.restrict.cooldown ? options.restrict.cooldown : 0;

        /**
         * @type {Array<number>}
         */
        this.permissions = options.restrict.permissions ? options.restrict.permissions : [];

        /**
         * @type {ChatEnvironment|Array<ChatEnvironment>}
         * @readonly
         */
        this.environment = options.restrict.env !== undefined ? options.restrict.env : ChatEnvironment.Anywhere;

        // TODO: Default auth level to 'default'
        /**
         * @type {number}
         * @readonly
         */
        this.auth = options.restrict.auth !== undefined ? options.restrict.auth : 0;

        /**
         * @type {Array<string>}
         * @readonly
         */
        this.exclude = options.restrict.exclude ? options.restrict.exclude : [];
    }

    /**
     * @param {string} query
     * @return {boolean} Whether the query is excluded
     */
    isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    get minArguments(): number {
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
     * @return {number} The maximum amount of arguments that this command accepts
     */
    get maxArguments(): number {
        return Object.keys(this.args).length;
    }

    /**
     * Validate a command module
     * @param {Object} data The module to validate
     * @return {boolean} Whether the module is valid
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
