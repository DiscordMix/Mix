import Util from "../core/utils";
import CommandRegistry from "./command-store";

import Command, {
    ArgumentType,
    ArgumentTypeChecker,
    DefaultValueResolver,
    IArgument,
    IArgumentResolver,
    ICustomArgType,
    RawArguments,
    Type
} from "./command";

import {Message} from "discord.js";
import {FalseDelegates, TrueDelegates} from "../core/constants";
import Log from "../core/log";
import Patterns from "../core/patterns";
import SwitchParser, {ICommandSwitch} from "./switch-parser";

export interface IResolveArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: IArgument[];
    readonly resolvers: IArgumentResolver[];
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
    readonly types: ICustomArgType[];
    readonly message: Message;
    readonly command: Command;
}

export default abstract class CommandParser {
    /**
     * @param {string} commandString
     * @param {CommandRegistry} manager
     * @param {string[]} prefixes
     * @return {Command | null}
     */
    public static async parse(commandString: string, manager: CommandRegistry, prefixes: string[]): Promise<Command | null> {
        const commandBase: string | null = this.getCommandBase(commandString, prefixes);

        if (commandBase) {
            return await manager.get(commandBase);
        }

        return null;
    }

    /**
     * @param {string} commandString
     * @param {CommandRegistry} manager
     * @param {string} prefixes
     * @return {boolean}
     */
    public static validate(commandString: string, manager: CommandRegistry, prefixes: string[]): boolean {
        for (const prefix of prefixes) {
            if (commandString.startsWith(prefix)) {
                const commandBase: string | null = this.getCommandBase(commandString, prefixes);

                if (commandBase !== null) {
                    return manager.contains(commandBase);
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
        const result: RawArguments = [];
        const argCleanExpression: RegExp = /(```|`|'|"|)(.+)\1/;

        let match: RegExpExecArray | null = Patterns.args.exec(commandString);

        while (match != null) {
            // TODO: Hotfix/review
            const match1: RegExpExecArray | null = argCleanExpression.exec(match[1]);

            if (match1) {
                result.push(match1[2] as any);
            }

            match = Patterns.args.exec(commandString);
        }

        const switches: ICommandSwitch[] = SwitchParser.getSwitches(commandString);

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
     * Resolve the command arguments' values
     * @param {IResolveArgumentsOptions} options
     * @return {*} The resolved arguments
     */
    public static resolveArguments(options: IResolveArgumentsOptions): any {
        const result: any = {};

        // If the command accept no arguments, return an empty object
        if (options.schema.length === 0) {
            return result;
        }

        for (let a: number = 0; a < options.arguments.length; a++) {
            const schemaEntry: any = options.schema[a];

            let typeFound: boolean = false;

            // Ignore the type if it's not a string
            if (CommandParser.isTypeValid(schemaEntry.type)) {
                throw Log.error(`Expecting type of schema entry '${schemaEntry.name}' to be either a string or a trivial type`);
            }

            for (const resolver of options.resolvers) {
                // If a resolver exists for this schema type, resolve the value
                if (resolver.name === schemaEntry.type) {
                    typeFound = true;
                    result[options.schema[a].name] = resolver.resolve(options.arguments[a] as any, options.message);

                    break;
                }
            }

            // Leave the value as-is if the resolver does not exist
            if (!typeFound) {
                // Don't add an 'undefined' spot
                if (options.arguments[a] !== undefined) {
                    result[options.schema[a].name] = options.arguments[a];
                }
            }
        }

        // Return the resolved arguments to be passed to the command executed() method
        return result;
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
                    throw new Error(`Expecting default value for command '${options.command.meta.name}' argument '${options.schema[i].name}'`);
                }

                const type: string = typeof options.schema[i].defaultValue;

                if (type === "function") {
                    value = (options.schema[i].defaultValue as DefaultValueResolver)(options.message);
                }
                else if (type === "string" || type === "number" || type === "boolean") {
                    value = options.schema[i].defaultValue as any;
                }
                else {
                    throw new Error(`Invalid default value for command '${options.command.meta.name}' argument '${options.schema[i].name}'; Expecting either string, number or function`);
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
            // In-command trivial type
            if (CommandParser.isTypeTrivial(options.schema[i].type)) {
                if (options.schema[i].type === Type.String) {
                    if (typeof (options.arguments[i]) !== "string") {
                        return false;
                    }
                }
                else if (options.schema[i].type === Type.Boolean) {
                    if (CommandParser.parseBoolean(options.arguments[i] as any) === null) {
                        return false;
                    }
                }
                else {
                    const value: number = parseInt(options.arguments[i] as any);

                    // Value must be a number at this point
                    if (isNaN(value)) {
                        return false;
                    }

                    switch (options.schema[i].type) {
                        case Type.Integer: {
                            // Integer covers all numbers

                            break;
                        }

                        case Type.UnsignedInteger: {
                            // Value must be higher or equal to zero
                            if (value < 0) {
                                return false;
                            }

                            break;
                        }

                        case Type.NonZeroInteger: {
                            // Value must be one or higher
                            if (value < 1) {
                                return false;
                            }

                            break;
                        }

                        default: {
                            // Shouldn't reach this point in code
                            Log.warn(`You should not be able to reach this point in code under any circumstances while checking type: ${options.schema[i].name}`);

                            return false;
                        }
                    }
                }
            }
            // User-defined type (argumentTypes)
            else if (typeof (options.schema[i].type) === "string") {
                let found = false;

                for (const type of options.types) {
                    if (type.name === options.schema[i].type) {
                        found = true;

                        if (type.check instanceof RegExp && !(type.check as RegExp).test(options.arguments[i] as any)) {
                            return false;
                        }
                        else if (typeof (type.check) === "function") {
                            if (!(type.check as ArgumentTypeChecker)(options.arguments[i] as any, options.message)) {
                                return false;
                            }
                        }
                    }
                }

                if (!found) {
                    Log.warn(`Missing user-defined type check for type: ${options.schema[i].type}`);

                    return false;
                }
            }
            // In-command regex expression
            else if (options.schema[i].type instanceof RegExp) {
                if (!(options.schema[i].type as RegExp).test(options.arguments[i] as any)) {
                    return false;
                }
            }
            // In-command method check
            else if (typeof (options.schema[i].type) === "function") {
                if (!(options.schema[i].type as ArgumentTypeChecker)(options.arguments[i] as any, options.message)) {
                    return false;
                }
            }
            else {
                throw Log.fatal(`Invalid argument type type, expected either a function or a regex expression: ${options.schema[i].name}`);
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
     * @return {boolean}
     */
    protected static isTypeTrivial(type: ArgumentType): boolean {
        return typeof (type) === "number" && Type[type] !== undefined;
    }

    /**
     * @param {ArgumentType} type
     * @return {boolean} Whether the provided type is valid
     */
    protected static isTypeValid(type: ArgumentType): boolean {
        return typeof type !== "string" && !CommandParser.isTypeTrivial(type);
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
