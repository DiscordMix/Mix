import Log from "../core/log";
import {Argument} from "./command";

export default class ArgumentParser {
    /**
     * @param {string} type
     * @param {string} arg
     * @param {object} resolvers
     * @return {*}
     */
    public static resolve(type: string, arg: string, resolvers: any): any {
        const keys: string[] = Object.keys(resolvers);

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === type) {
                return resolvers[keys[i]](arg);
            }
        }

        Log.error(`[CommandArgumentParser.resolve] Argument resolver missing: ${type}`);
    }

    /**
     * @param {Argument[]} schema
     * @return {Argument[]}
     */
    public static getRequiredArguments(schema: Argument[]): Argument[] {
        return schema.filter((arg: Argument) => arg.required);
    }
}
