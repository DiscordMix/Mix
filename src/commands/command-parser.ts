import Utils from "../core/utils";
import CommandManager from "./command-manager";
import Command from "./command";

export default class CommandParser {
    /**
     * @param {string} commandString
     * @param {CommandManager} manager
     * @param {string} prefix
     * @return {Command|null}
     */
    static parse(commandString: string, manager: CommandManager, prefix: string): Command | null {
        const commandBase = this.getCommandBase(commandString, prefix);

        if (commandBase) {
            return manager.getByName(commandBase);
        }

        return null;
    }

    /**
     * @param {string} commandString
     * @param {CommandManager} manager
     * @param {string} prefix
     * @return {boolean}
     */
    static isValid(commandString: string, manager: CommandManager, prefix: string): boolean {
        if (commandString.startsWith(prefix)) {
            const commandBase = this.getCommandBase(commandString, prefix);

            if (commandBase) {
                return manager.isRegistered(commandBase);
            }
        }

        return false;
    }

    /**
     * @param {string} commandString
     * @param {string} prefix
     * @return {string|null}
     */
    static getCommandBase(commandString: string, prefix: string): string | null {
        const regexResult = new RegExp(`^${Utils.escapeRegexString(prefix)}([a-zA-Z]+)`).exec(commandString);

        if (regexResult) {
            return regexResult[1];
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
     * @return {Array<string>} The resolved arguments
     */
    static resolveArguments(args: Array<string>, types: any, resolvers: any): Array<string> {
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
                        result[argIdx] = resolvers[typeKeys[typeIdx]](result[argIdx]);
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
