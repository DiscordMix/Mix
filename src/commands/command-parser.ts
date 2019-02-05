import {ICommandRegistry} from "./command-registry";
import Util from "../core/util";
import Command, {DefaultValueResolver, IArgument, RawArguments} from "./command";
import {Message} from "discord.js";
import {FalseDelegates, TrueDelegates} from "../core/constants";
import Log from "../core/log";
import Pattern from "../core/pattern";
import FlagParser, {ICommandFlag} from "./flag-parser";
import {TypeChecker, ArgumentType, ArgumentResolver} from "./type";

export interface IResolveArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: IArgument[];
    readonly resolvers: Map<ArgumentType, ArgumentResolver>;
    readonly message: Message;
}

export interface IResolveDefaultArgsOptions {
    readonly arguments: RawArguments;
    readonly schema: IArgument[];
    readonly message: Message;
    readonly command: Command;
}

export interface ICheckArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: IArgument[];
    readonly message: Message;
    readonly command: Command;
}

/**
 * Utility class for command parsing and validation.
 */
export default abstract class CommandParser {
    /**
     * @param {string} commandString
     * @param {ICommandRegistry} registry
     * @param {string[]} prefixes
     * @return {Command | null}
     */
    public static async parse(commandString: string, registry: ICommandRegistry, prefixes: string[]): Promise<Command | null> {
        const commandBase: string | null = this.getCommandBase(commandString, prefixes);

        if (commandBase) {
            return await registry.get(commandBase);
        }

        return null;
    }

    /**
     * @param {string} commandString
     * @param {CommandRegistry} registry
     * @param {string} prefixes
     * @return {boolean}
     */
    public static validate(commandString: string, registry: ICommandRegistry, prefixes: string[]): boolean {
        for (const prefix of prefixes) {
            if (commandString.startsWith(prefix)) {
                const commandBase: string | null = this.getCommandBase(commandString, prefixes);

                if (commandBase !== null) {
                    return registry.contains(commandBase);
                }
            }
        }

        return false;
    }

    /**
     * @param {string} commandString
     * @param {string[]} prefixes
     * @return {string | null}
     */
    public static getCommandBase(commandString: string, prefixes: string[]): string | null {
        for (const prefix of prefixes) {
            const regexResult = new RegExp(`^${Util.escapeRegexString(prefix)}([a-zA-Z]+)`).exec(commandString);

            if (regexResult) {
                return regexResult[1];
            }
        }

        return null;
    }

    // TODO: CRITICAL: %say -s=true -> would receive arguments as [ '-s=true', 'true' ]
    /**
     * @param {string} commandString
     * @return {string[]}
     */
    public static getArguments(commandString: string, schema: IArgument[]): RawArguments {

        // TODO: Rewrite/update this function with the new Type system.

        const result: RawArguments = [];
        const argCleanExpression: RegExp = /(```|`|'|"|)(.+)\1/;

        let match: RegExpExecArray | null = Pattern.args.exec(commandString);

        while (match != null) {
            // TODO: Hotfix/review
            const match1: RegExpExecArray | null = argCleanExpression.exec(match[1]);

            if (match1) {
                result.push(match1[2] as any);
            }

            match = Pattern.args.exec(commandString);
        }

        const switches: ICommandFlag[] = FlagParser.getSwitches(commandString);

        for (const sw of switches) {
            // TODO: Was just left here without being used..
            const switchString: string = `${sw.key}${sw.value ? "=" : ""}${sw.value || ""}`;

            for (let i: number = 0; i < schema.length; i++) {
                if (!sw.short && sw.key === schema[i].name) {
                    result[i] = sw.value || true;

                    if (result[i].toString().indexOf(" ") !== -1) {
                        const spaces: number = result[i].toString().split(" ").length - 1;

                        for (let counter = 0; counter < spaces; counter++) {
                            result.pop();
                        }
                    }

                    // result.splice(result.indexOf(switchString), 1);

                    break;
                }
                else if (schema[i].switchShortName && sw.short && sw.key === schema[i].switchShortName) {
                    result[i] = sw.value || true;

                    if (result[i].toString().indexOf(" ") !== -1) {
                        const spaces: number = result[i].toString().split(" ").length - 1;

                        for (let counter = 0; counter < spaces; counter++) {
                            result.pop();
                        }
                    }

                    // result.splice(result.indexOf(switchString), 1);

                    break;
                }
            }
        }

        return result;
    }

    /**
     * Resolve the command arguments' values.
     * @param {IResolveArgumentsOptions} opts
     * @return {Promise<*>} An object containing the resolved arguments.
     */
    public static async resolveArguments(opts: IResolveArgumentsOptions): Promise<any> {

        // TODO: Pending re-write. (Re-write has started but not completed, entire function).

        const args: any = {};

        let argPosCounter: number = 0;

        for (const arg of opts.schema) {
            // Invoke the corresponding resolver and set the returned value.
            if (opts.resolvers.has(arg.type)) {
                args[arg.name] = await opts.resolvers.get(arg.type)!(opts.arguments[argPosCounter], opts.message);
            }
            // There was no resolver, copy the existing value.
            else {
                args[arg.name] = opts.arguments[argPosCounter];
            }

            argPosCounter++;
        }

        return args;
    }

    /**
     * @param {IResolveDefaultArgsOptions} options
     * @return {RawArguments}
     */
    public static resolveDefaultArgs(options: IResolveDefaultArgsOptions): RawArguments {
        const result: RawArguments = [];

        for (let i: number = 0; i < options.schema.length; i++) {
            let value: any = options.arguments[i];

            if (!options.schema[i].required && options.arguments[i] === undefined && options.schema[i].defaultValue !== undefined) {
                if (options.schema[i].defaultValue === undefined) {
                    throw Log.error(`Expecting default value for command '${options.command.meta.name}' argument '${options.schema[i].name}'`);
                }

                const type: string = typeof options.schema[i].defaultValue;

                if (type === "function") {
                    value = (options.schema[i].defaultValue as DefaultValueResolver)(options.message);
                }
                else if (type === "string" || type === "number" || type === "boolean") {
                    value = options.schema[i].defaultValue as any;
                }
                else {
                    throw Log.error(`Invalid default value for command '${options.command.meta.name}' argument '${options.schema[i].name}'; Expecting either string, number or function`);
                }
            }
            else if (!options.schema[i].required && options.arguments[i] === undefined && options.schema[i].defaultValue === undefined) {
                // Don't leave an 'undefined' spot
                continue;
            }

            result[i] = value;
        }

        return result;
    }

    /**
     * @param {ICheckArgumentsOptions} options
     * @return {boolean}
     */
    public static checkArguments(options: ICheckArgumentsOptions): boolean {
        // Invalid amount of arguments
        if (!CommandParser.validateArgumentCount(options.command, options.arguments)) {
            return false;
        }

        // TODO: Will this work with optional args?
        for (let i: number = 0; i < options.arguments.length; i++) {
            if (typeof (options.schema[i].type) === "function") {
                if (!(options.schema[i].type as TypeChecker)(options.arguments[i] as any, options.message)) {
                    return false;
                }
            }
            else {
                throw Log.fatal(`Invalid argument type type, expected a function that returns a boolean: ${options.schema[i].name}`);
            }
        }

        return true;
    }

    /**
     * @param {Command} command
     * @param {RawArguments} args
     * @return {boolean} Whether the argument count is valid
     */
    protected static validateArgumentCount(command: Command, args: RawArguments): boolean {
        if (command.singleArg && (args.length < command.maxArguments || args.length > command.minArguments)) {
            return false;
        }
        else if (args.length > command.maxArguments || args.length < command.minArguments) {
            return false;
        }

        return true;
    }

    /**
     * @param {ArgumentType} type
     * @return {boolean} Whether the provided type is valid
     */
    protected static isTypeValid(type: ArgumentType): boolean {
        return typeof type === "function";
    }

    /**
     * @param {string} value
     * @return {boolean | null}
     */
    protected static parseBoolean(value: string): boolean | null {
        value = value.toString().toLowerCase();

        if (TrueDelegates.includes(value)) {
            return true;
        }
        else if (FalseDelegates.includes(value)) {
            return false;
        }

        return null;
    }
}
