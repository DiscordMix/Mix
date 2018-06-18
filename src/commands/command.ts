import ChatEnvironment from "../core/chat-environment";
import CommandExecutionContext from "./command-execution-context";

const Typer = require("@raxor1234/typer/typer");

export interface CommandOptions {
    readonly executed: (context: CommandExecutionContext) => any;
    readonly meta: CommandMetaOptions;
    readonly restrict?: CommandRestrictOptions;
    readonly canExecute?: Function;
}

export interface CommandMetaOptions {
    readonly name: string;
    readonly desc?: string;
    readonly aliases?: Array<string>;
    readonly args?: any;
    readonly newArgs?: Array<CommandMetaArgument>;
    readonly singleArg?: boolean;
}

export interface CommandRestrictOptions {
    readonly enabled?: boolean;
    readonly cooldown?: number;
    readonly selfPerms?: Array<any>; // TODO: Permission type
    readonly issuerPerms?: Array<any>; // TODO: Permission type again
    readonly env?: ChatEnvironment;
    readonly auth?: number;
    readonly exclude?: Array<string>;
}

// TODO: Make use of this
export interface CommandMetaArgument {
    readonly name: string;
    readonly type: string;
    readonly desc?: string;
    readonly defaultValue?: any;
    readonly required?: boolean;
}

export default class Command {
    readonly name: string;
    readonly description: string;
    readonly aliases: Array<string>;
    readonly executed: (context: CommandExecutionContext) => any;
    readonly canExecute: Function | boolean;
    readonly args: any;
    readonly newArgs: Array<CommandMetaArgument>;
    readonly isEnabled: boolean;
    readonly cooldown: number;
    readonly selfPermissions: Array<any>; // TODO: Type hotfix
    readonly issuerPermissions: Array<any>; // TODO: Type hotfix again
    readonly environment: ChatEnvironment;
    readonly auth: number;
    readonly exclude: Array<string>;
    readonly singleArg: boolean;

    /**
     * @param {CommandOptions} options
     */
    constructor(options: CommandOptions) {
        /**
         * The name by which the command will be executed
         * @type {string}
         * @readonly
         */
        this.name = options.meta.name;

        /**
         * The description of the command
         * @type {string}
         * @readonly
         */
        this.description = options.meta.desc ? options.meta.desc : "No description provided";

        /**
         * The list of alternative names that will execute this command
         * @type {Array<string>}
         * @readonly
         */
        this.aliases = options.meta.aliases ? options.meta.aliases : [];

        /**
         * The method called when this command is successfully executed
         * @type {Function}
         * @readonly
         */
        this.executed = options.executed;

        /**
         * A method that determines whether this command can execute
         * @type {Function}
         * @readonly
         */
        this.canExecute = options.canExecute ? options.canExecute : true;

        /**
         * An object describing the required and optional arguments accepted by the command
         * @type {Object}
         * @readonly
         */
        this.args = options.meta.args ? options.meta.args : {};

        /**
         * The new argument array containing the required and optional arguments accepted by the command
         * @type {Array<CommandMetaArgument>}
         * @readonly
         */
        this.newArgs = options.meta.newArgs ? options.meta.newArgs : [];

        /**
         * Whether this command is enabled and can be executed
         * @type {boolean}
         * @readonly
         */
        this.isEnabled =  options.restrict && options.restrict.enabled !== undefined ? options.restrict.enabled : true;

        /**
         * @todo Should be determined automatically?
         * Whether the command is intended to only have a single argument
         * @type {boolean}
         * @readonly
         */
        this.singleArg = options.meta.singleArg !== undefined ? options.meta.singleArg : false;

        /**
         * The time between required between each command execution (per user)
         * @type {number}
         * @readonly
         */
        this.cooldown = options.restrict && options.restrict.cooldown ? options.restrict.cooldown : 0;

        /**
         * Permissions required by the bot itself
         * @type {Array<number>}
         */
        this.selfPermissions = options.restrict && options.restrict.selfPerms ? options.restrict.selfPerms : [];

        /**
         * Permissions required by the command issuer
         * @type {Array<*>}
         */
        this.issuerPermissions = options.restrict && options.restrict.issuerPerms ? options.restrict.issuerPerms : [];

        /**
         * The exclusive environment where this command is allowed to execute
         * @type {ChatEnvironment|Array<ChatEnvironment>}
         * @readonly
         */
        this.environment = options.restrict && options.restrict.env !== undefined ? options.restrict.env : ChatEnvironment.Anywhere;

        // TODO: Default auth level to 'default'
        /**
         * The authorization level required by the command issuer
         * @type {number}
         * @readonly
         */
        this.auth = options.restrict && options.restrict.auth !== undefined ? options.restrict.auth : 0;

        /**
         * List of users, channels, roles, and/or guilds blocked from using this command
         * @type {Array<string>}
         * @readonly
         */
        this.exclude = options.restrict && options.restrict.exclude ? options.restrict.exclude : [];
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
     * Determine whether a command module is valid
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
            ignoreArgs: "boolean"
        }, data.meta, {
            array: (val: any) => val instanceof Array
        });

        let restrict = true;

        if (data.restrict) {
            restrict = Typer.validate({
                auth: "number",
                permissions: ":array",
                env: "number"
            }, data.restrict, {
                array: (val: any) => val instanceof Array
            });
        }

        const extraChecks = !(data.meta.args && data.meta.singleArg);

        return (methods && meta && restrict && extraChecks);
    }
}
