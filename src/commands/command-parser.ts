import Utils from "../core/utils";
import CommandStore from "./command-store";

import Command, {
    ArgumentType,
    ArgumentTypeChecker,
    Argument,
    ArgumentResolver, DefaultValueResolver,
    PrimitiveArgType,
    RawArguments,
    CustomArgType
} from "./command";

import {Message} from "discord.js";
import Log from "../core/log";
import {DecoratorCommand} from "../decorators/decorators";

export interface ResolveArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: Argument[];
    readonly resolvers: ArgumentResolver[];
    readonly message: Message;
}

export interface ResolveDefaultArgsOptions {
    readonly arguments: RawArguments;
    readonly schema: Argument[];
    readonly message: Message;
    readonly command: Command;
}

export interface CheckArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: Argument[];
    readonly types: CustomArgType[];
    readonly message: Message;
    readonly command: Command;
}

export default class CommandParser {
    /**
     * @param {string} commandString
     * @param {CommandStore} manager
     * @param {string[]} prefixes
     * @return {Command | null}
     */
    public static parse(commandString: string, manager: CommandStore, prefixes: string[]): Command | DecoratorCommand | null {
        const commandBase: string | null = this.getCommandBase(commandString, prefixes);

        if (commandBase) {
            return manager.get(commandBase);
        }

        return null;
    }

    /**
     * @param {string} commandString
     * @param {CommandStore} manager
     * @param {string} prefixes
     * @return {boolean}
     */
    public static validate(commandString: string, manager: CommandStore, prefixes: string[]): boolean {
        for (let i: number = 0; i < prefixes.length; i++) {
            if (commandString.startsWith(prefixes[i])) {
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
        for (let i: number = 0; i < prefixes.length; i++) {
            const regexResult = new RegExp(`^${Utils.escapeRegexString(prefixes[i])}([a-zA-Z]+)`).exec(commandString);

            if (regexResult) {
                return regexResult[1];
            }
        }

        return null;
    }

    /**
     * @param {string} commandString
     * @return {string[]}
     */
    public static getArguments(commandString: string): RawArguments {
        const expression: RegExp = / (```((?!```).)*```|"[^"]+"|'[^']+'|`[^`]+`|[^ ]+|[^ ]+(;|^))/g;
        const argCleanExpression: RegExp = /(```|`|'|"|)(.+)\1/;
        const result: RawArguments = [];

        let match: RegExpExecArray | null = expression.exec(commandString);

        while (match != null) {
            // TODO: Hotfix/review
            const match1: RegExpExecArray | null = argCleanExpression.exec(match[1]);

            if (match1) {
                result.push(match1[2]);
            }

            match = expression.exec(commandString);
        }

        return result;
    }

    /**
     * Resolve the command arguments' values
     * @param {ResolveArgumentsOptions} options
     * @return {Array<*> | null} The resolved arguments
     */
    public static resolveArguments(options: ResolveArgumentsOptions): any | null {
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
                Log.error(`[CommandParser.resolveArguments] Expecting type of schema entry '${schemaEntry.name}' to be either a string or a primitive type`);

                return null;
            }

            for (let r: number = 0; r < options.resolvers.length; r++) {
                // If a resolver exists for this schema type, resolve the value
                if (options.resolvers[r].name === schemaEntry.type) {
                    typeFound = true;
                    result[options.schema[a].name] = options.resolvers[r].resolve(options.arguments[a], options.message);

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
     * @param {ResolveDefaultArgsOptions} options
     * @return {*}
     */
    public static resolveDefaultArgs(options: ResolveDefaultArgsOptions): RawArguments {
        const result: RawArguments = [];

        for (let i = 0; i < options.schema.length; i++) {
            let value: string = options.arguments[i];

            if (!options.schema[i].required && options.arguments[i] === undefined && options.schema[i].defaultValue !== undefined) {
                if (options.schema[i].defaultValue === undefined) {
                    throw new Error(`[CommandParser.resolveDefaultArgs] Expecting default value for command '${options.command.meta.name}' argument '${options.schema[i].name}'`);
                }

                const type: string = typeof options.schema[i].defaultValue;

                if (type === "function") {
                    value = (options.schema[i].defaultValue as DefaultValueResolver)(options.message);
                }
                else if (type === "string") {
                    value = options.schema[i].defaultValue as string;
                }
                else if (type === "number") {
                    value = (options.schema[i].defaultValue as number).toString();
                }
                else {
                    throw new Error(`[CommandParser.resolveDefaultArgs] Invalid default value for command '${options.command.meta.name}' argument '${options.schema[i].name}'; Expecting either string, number or function`);
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
     * @param {CheckArgumentsOptions} options
     * @return {boolean}
     */
    public static checkArguments(options: CheckArgumentsOptions): boolean {
        // Invalid amount of arguments
        if (!CommandParser.validateArgumentCount(options.command, options.arguments)) {
            return false;
        }

        // TODO: Will this work with optional args?
        for (let i: number = 0; i < options.arguments.length; i++) {
            // In-command primitive type
            if (CommandParser.isTypePrimitive(options.schema[i].type)) {
                if (options.schema[i].type === PrimitiveArgType.String) {
                    if (typeof(options.arguments[i]) !== "string") {
                        return false;
                    }
                }
                else if (options.schema[i].type === PrimitiveArgType.Boolean) {
                    if (CommandParser.parseBoolean(options.arguments[i]) === null) {
                        return false;
                    }
                }
                else {
                    const value: number = parseInt(options.arguments[i]);

                    // Value must be a number at this point
                    if (isNaN(value)) {
                        return false;
                    }

                    switch (options.schema[i].type) {
                        case PrimitiveArgType.Integer: {
                            // Integer covers all numbers

                            break;
                        }

                        case PrimitiveArgType.UnsignedInteger: {
                            // Value must be higher or equal to zero
                            if (value < 0) {
                                return false;
                            }

                            break;
                        }

                        case PrimitiveArgType.NonZeroInteger: {
                            // Value must be one or higher
                            if (value < 1) {
                                return false;
                            }

                            break;
                        }

                        default: {
                            // Shouldn't reach this point in code
                            Log.warn(`[CommandParser.checkArguments] You should not be able to reach this point in code under any circumstances while checking type: ${options.schema[i].name}`);

                            return false;
                        }
                    }
                }
            }
            // User-defined type (argumentTypes)
            else if (typeof(options.schema[i].type) === "string") {
                let found = false;

                for (let t: number = 0; t < options.types.length; t++) {
                    if (options.types[t].name === options.schema[i].type) {
                        found = true;

                        if (options.types[t].check instanceof RegExp && !(options.types[t].check as RegExp).test(options.arguments[i])) {
                            return false;
                        }
                        else if (typeof(options.types[t].check) === "function") {
                            if (!(options.types[t].check as ArgumentTypeChecker)(options.arguments[i], options.message)) {
                                return false;
                            }
                        }
                    }
                }

                if (!found) {
                    Log.warn(`[CommandParser.checkArguments] Missing user-defined type check for type: ${options.schema[i].type}`);

                    return false;
                }
            }
            // In-command regex expression
            else if (options.schema[i].type instanceof RegExp) {
                if (!(options.schema[i].type as RegExp).test(options.arguments[i])) {
                    return false;
                }
            }
            // In-command method check
            else if (typeof(options.schema[i].type) === "function") {
                if (!(options.schema[i].type as ArgumentTypeChecker)(options.arguments[i], options.message)) {
                    return false;
                }
            }
            else {
                Log.throw(`[CommandParser.checkArguments] Invalid argument type type, expected either a function or a regex expression: ${options.schema[i].name}`);
            }
        }

        return true;
    }

    /**
     * @param {Command} command
     * @param {RawArguments} args
     * @return {boolean} Whether the argument count is valid
     */
    private static validateArgumentCount(command: Command, args: RawArguments): boolean {
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
    private static isTypePrimitive(type: ArgumentType): boolean {
        return typeof(type) === "number" && PrimitiveArgType[type] !== undefined;
    }

    /**
     * @param {ArgumentType} type
     * @return {boolean} Whether the provided type is valid
     */
    private static isTypeValid(type: ArgumentType): boolean {
        return typeof type !== "string" && !CommandParser.isTypePrimitive(type);
    }

    /**
     * @param {string} value
     * @return {boolean | null}
     */
    private static parseBoolean(value: string): boolean | null {
        const lowerCaseValue: string = value.toLowerCase();

        if (lowerCaseValue == "true" || lowerCaseValue == "1" || lowerCaseValue == "yes") {
            return true;
        }
        else if (lowerCaseValue == "false" || lowerCaseValue == "0" || lowerCaseValue == "no") {
            return false;
        }

        return null;
    }
}
