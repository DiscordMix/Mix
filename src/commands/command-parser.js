import Utils from "../core/utils";

export default class CommandParser {
    /**
     * @param {String} commandString
     * @param {CommandManager} manager
     * @param {String} trigger
     * @returns {*}
     */
    static parse(commandString, manager, trigger) {
        if (this.isValid(commandString, manager, trigger)) {
            return manager.getByName(this.getCommandBase(commandString, trigger));
        }

        return null;
    }

    /**
     * @param {String} commandString
     * @param {CommandManager} manager
     * @param {String} prefix
     * @returns {Boolean}
     */
    static isValid(commandString, manager, prefix) {
        if (commandString.startsWith(prefix)) {
            return manager.isRegistered(this.getCommandBase(commandString, prefix));
        }

        return false;
    }

    /**
     * @param {String} commandString
     * @param {String} trigger
     * @returns {*}
     */
    static getCommandBase(commandString, trigger) {
        const regexResult = new RegExp(`^${Utils.escapeRegexString(trigger)}([a-zA-Z]+)`).exec(commandString);

        if (regexResult) {
            return regexResult[1];
        }

        return null;
    }

    /**
     *
     * @param {String} commandString
     * @returns {Array<String>}
     */
    static getArguments(commandString) {
        const expression = / (```((?!```).)*```|"[^"]+"|'[^']+'|`[^`]+`|[^ ]+)/g;
        const argCleanExpression = /(```|`|'|"|)(.+)\1/;
        const result = [];

        let match = expression.exec(commandString);

        while (match != null) {
            result.push(argCleanExpression.exec(match[1])[2]);
            match = expression.exec(commandString);
        }

        return result;
    }

    // TODO: Also take in arg schema to avoid matching accidental args.
    /**
     * @param {Array<String>} args
     * @param {Object} types
     * @param {Object} resolvers
     * @returns {Array<String>} The resolved arguments
     */
    static resolveArguments(args, types, resolvers) {
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
