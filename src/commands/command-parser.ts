import Utils from "../core/utils";
import CommandStore from "./command-store";
import Command, { ArgumentType, CommandArgumentResolver, PrimitiveArgumentType, CommandArgument, RawArguments, ArgumentTypeChecker, UserDefinedArgType } from "./command";
import {Message} from "discord.js";
import Log from "../core/log";
import CommandArgumentParser from "./command-argument-parser";

export interface ResolveArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: Array<CommandArgument>;
    readonly resolvers: Array<CommandArgumentResolver>;
    readonly message: Message;
}

export interface CheckArgumentsOptions {
    readonly arguments: RawArguments;
    readonly schema: Array<CommandArgument>;
    readonly types: Array<UserDefinedArgType>;
    readonly message: Message;
    readonly command: Command;
}

export default class CommandParser {
    /**
     * @param {string} commandString
     * @param {CommandStore} manager
     * @param {Array<string>} prefixes
     * @return {Command | null}
     */
    public static parse(commandString: string, manager: CommandStore, prefixes: Array<string>): Command | null {
        const commandBase: string | null = this.getCommandBase(commandString, prefixes);

        if (commandBase) {
            return manager.getByName(commandBase);
        }

        return null;
    }

    /**
     * @param {string} commandString
     * @param {CommandStore} manager
     * @param {string} prefixes
     * @return {boolean}
     */
    public static validate(commandString: string, manager: CommandStore, prefixes: Array<string>): boolean {
        for (let i: number = 0; i < prefixes.length; i++) {
            if (commandString.startsWith(prefixes[i])) {
                const commandBase = this.getCommandBase(commandString, prefixes);

                if (commandBase) {
                    return manager.isRegistered(commandBase);
                }
            }
        }

        return false;
    }

    /**
     * @param {string} commandString
     * @param {Array<string>} prefixes
     * @return {string | null}
     */
    public static getCommandBase(commandString: string, prefixes: Array<string>): string | null {
        for (let i: number = 0; i < prefixes.length; i++) {
            const regexResult = new RegExp(`^${Utils.escapeRegexString(prefixes[i])}([a-zA-Z]+)`).exec(commandString);

            if (regexResult) {
                return regexResult[1];
            }
        }

        return null;
    }

    /**
     *
     * @param {string} commandString
     * @return {Array<string>}
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
     * @return {Array<*>} The resolved arguments
     */
    public static resolveArguments(options: ResolveArgumentsOptions): any {
        const result: any = {};

        for (let a: number = 0; a < options.arguments.length; a++) {
            let typeFound = false;

            for (let r: number = 0; r < options.resolvers.length; r++) {
                // Loop through all the schema types, check if they have resolvers
                for (let t: number = 0; t < options.schema.length; t++) {
                    // If a resolver exists for this schema type, resolve the value
                    if (options.resolvers[r].name === options.schema[t].name) {
                        typeFound = true;
                        result[options.schema[a].name] = options.resolvers[r].resolve(options.arguments[a], options.message);
                    }
                }
            }

            // Leave the value as-is if the resolver does not exist
            if (!typeFound) {
                result[options.schema[a].name] = options.arguments[a];
            }
        }

        // Return the resolved arguments to be passed to the command executed() method
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
                if (options.schema[i].type === PrimitiveArgumentType.String) {
                    if (typeof(options.arguments[i]) !== "string") {
                        return false;
                    }
                }
                else if (options.schema[i].type === PrimitiveArgumentType.Boolean) {
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
                        case PrimitiveArgumentType.Integer: {
                            // Integer covers all numbers

                            break;
                        }

                        case PrimitiveArgumentType.WholeNumber: {
                            // Value must be higher or equal to zero
                            if (value < 0) {
                                return false;
                            }

                            break;
                        }

                        case PrimitiveArgumentType.NonZeroWholeNumber: {
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
        return typeof(type) === "number" && PrimitiveArgumentType[type] !== undefined;
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
