import Log from "../core/log";
import {CommandArgument} from "./command";

export default class CommandArgumentParser {
    /**
     * @param {string} type
     * @param {string} arg
     * @param {Object} resolvers
     * @return {*}
     */
    public static resolve(type: string, arg: string, resolvers: any): any {
        const keys = Object.keys(resolvers);

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === type) {
                return resolvers[keys[i]](arg);
            }
        }

        Log.error(`[CommandArgumentParser.resolve] Argument resolver missing: ${type}`);
    }

    /**
     * @param {Array<CommandArgument>} schema
     * @return {Array<CommandArgument>}
     */
    public static getRequiredArguments(schema: Array<CommandArgument>): Array<CommandArgument> {
        return schema.filter((arg: CommandArgument) => arg.required);
    }
}
