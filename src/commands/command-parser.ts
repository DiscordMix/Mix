import Utils from "../core/utils";
import CommandStore from "./command-store";
import Command from "./command";
import CommandContext from "./command-context";
import {Message} from "discord.js";

export default class CommandParser {
    /**
     * @param {string} commandString
     * @param {CommandStore} manager
     * @param {Array<string>} prefixes
     * @return {Command|null}
     */
    static parse(commandString: string, manager: CommandStore, prefixes: Array<string>): Command | null {
        const commandBase = this.getCommandBase(commandString, prefixes);

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
    static isValid(commandString: string, manager: CommandStore, prefixes: Array<string>): boolean {
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
     * @return {string|null}
     */
    static getCommandBase(commandString: string, prefixes: Array<string>): string | null {
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
    static getArguments(commandString: string): Array<string> {
        const expression = / (```((?!```).)*```|"[^"]+"|'[^']+'|`[^`]+`|[^ ]+|[^ ]+(;|^))/g;
        const argCleanExpression = /(```|`|'|"|)(.+)\1/;
        const result = [];

        let match = expression.exec(commandString);

        while (match != null) {
            // TODO: Hotfix/review
            const match1 = argCleanExpression.exec(match[1]);

            if (match1) {
                result.push(match1[2]);
            }

            match = expression.exec(commandString);
        }

        return result;
    }

    // TODO: Also take in arg schema to avoid matching accidental args.
    /**
     * @param {Array<string>} args
     * @param {Object} types
     * @param {Object} resolvers
     * @param {Message} message
     * @return {Array<string>} The resolved arguments
     */
    static resolveArguments(args: Array<string>, types: any, resolvers: any, message: Message): Array<string> {
        const result = args;
        const typeKeys = Object.keys(types);

        for (let argIdx = 0; argIdx < result.length; argIdx++) {
            for (let typeIdx = 0; typeIdx < typeKeys.length; typeIdx++) {
                let match = false;

                if (typeof types[typeKeys[typeIdx]] === "function") {
                    match = types[typeKeys[typeIdx]](args[argIdx]);
                }
                else if (types[typeKeys[typeIdx]] instanceof RegExp) {
                    match = types[typeKeys[typeIdx]].test(args[argIdx]);
                }

                if (match) {
                    if (typeof resolvers[typeKeys[typeIdx]] === "function") {
                        result[argIdx] = resolvers[typeKeys[typeIdx]](result[argIdx], message);
                    }
                    // TODO: Issue further testing, there's a chance this is a bug.
                    /* else {
                        Log.error(`[CommandParser.resolveArguments] Expecting function but got '${typeof resolvers[typeKeys[typeIdx]]}'.`);
                    } */
                }
            }
        }

        return result;
    }
}
