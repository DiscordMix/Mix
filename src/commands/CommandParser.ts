import Command, {DefaultValueResolver, IArgument, RawArguments} from "./Command";
import {Message} from "discord.js";

namespace Commands {
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
        public static async parse(commandString: string, registry: ICommandRegistry, prefixes: string[]): Promise<Command | null> {
            const commandBase: string | null = this.getCommandBase(commandString, prefixes);

            if (commandBase) {
                return await registry.get(commandBase);
            }

            return null;
        }

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

        public static getCommandBase(commandString: string, prefixes: string[]): string | null {
            for (const prefix of prefixes) {
                const regexResult = new RegExp(`^${Util.escapeRegexString(prefix)}([a-zA-Z]+)`).exec(commandString);

                if (regexResult) {
                    return regexResult[1];
                }
            }

            return null;
        }

        // TODO: CRITICAL: %say -s=true -> would receive arguments as [ '-s=true', 'true' ].
        /**
         * Retrieve the arguments from a supplied command string and schema.
         * Omits the first argument (the prefix) from the result.
         *
         * Does not perform any conversions on the found argument values,
         * except for default 'true' boolean value which represents empty flags (flags without values).
         */
        public static getArguments(commandString: string, schema: IArgument[]): RawArguments {

            // TODO: Rewrite/update this function with the new Type system.

            if (typeof commandString !== "string") {
                throw Log.error("Expected input command string to be a string");
            }
            else if (!Array.isArray(schema)) {
                throw Log.error("Expected schema to be an argument array");
            }

            const result: RawArguments = [];
            const argCleanExpression: RegExp = /(```|`|'|"|)(.+)\1/;

            let match: RegExpExecArray | null = Pattern.args.exec(commandString);

            while (match != null) {
                // TODO: Hotfix/review | May need reset exec point.
                const match1: RegExpExecArray | null = argCleanExpression.exec(match[1]);

                if (match1) {
                    result.push(match1[2]);
                }

                match = Pattern.args.exec(commandString);
            }

            // Assemble and apply flags to the result.
            const flags: ICommandFlag[] = FlagParser.getFlags(commandString);

            for (const fl of flags) {
                // TODO: Was just left here without being used.
                const flagString: string = `${fl.key}${fl.value ? "=" : ""}${fl.value || ""}`;

                for (let i: number = 0; i < schema.length; i++) {
                    if (!fl.short && fl.key === schema[i].name) {
                        result[i] = fl.value || "true";

                        if (result[i].toString().indexOf(" ") !== -1) {
                            const spaces: number = result[i].toString().split(" ").length - 1;

                            for (let counter = 0; counter < spaces; counter++) {
                                result.pop();
                            }
                        }

                        // result.splice(result.indexOf(flagString), 1);

                        break;
                    }
                    else if (schema[i].flagShortName && fl.short && fl.key === schema[i].flagShortName) {
                        result[i] = fl.value || "true";

                        if (result[i].toString().indexOf(" ") !== -1) {
                            const spaces: number = result[i].toString().split(" ").length - 1;

                            for (let counter = 0; counter < spaces; counter++) {
                                result.pop();
                            }
                        }

                        // result.splice(result.indexOf(flagString), 1);

                        break;
                    }
                }
            }

            return result;
        }

        /**
         * Resolve the command arguments' values.
         * @return {Promise<*>} An object containing the resolved arguments.
         */
        public static async resolveArguments(opts: IResolveArgumentsOptions): Promise<any> {
            if (typeof opts !== "object" || opts === null || Array.isArray(opts)) {
                throw Log.error("Expected options parameter to be an object");
            }

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
                        value = options.schema[i].defaultValue;
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

        public static checkArguments(options: ICheckArgumentsOptions): boolean {
            // Invalid amount of arguments.
            if (!CommandParser.validateArgumentCount(options.command, options.arguments)) {
                return false;
            }

            // TODO: Will this work with optional args?
            for (let i: number = 0; i < options.arguments.length; i++) {
                if (typeof (options.schema[i].type) === "function") {
                    if (!(options.schema[i].type as TypeChecker)(options.arguments[i], options.message)) {
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
         * @return {boolean} Whether the argument count is valid.
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
         * @return {boolean} Whether the provided type is valid.
         */
        protected static isTypeValid(type: ArgumentType): boolean {
            return typeof type === "function";
        }

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
}
