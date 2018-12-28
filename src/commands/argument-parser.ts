import Log from "../core/log";
import {IArgument} from "./command";

export default class ArgumentParser {
    /**
     * @param {string} type
     * @param {string} arg
     * @param {object} resolvers
     * @return {*}
     */
    public static resolve(type: string, arg: string, resolvers: object): any {
        const keys: string[] = Object.keys(resolvers);

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === type) {
                return resolvers[keys[i]](arg);
            }
        }

        throw Log.error(`[CommandArgumentParser.resolve] Argument resolver missing: ${type}`);
    }

    /**
     * @param {IArgument[]} schema
     * @return {IArgument[]}
     */
    public static getRequiredArguments(schema: IArgument[]): IArgument[] {
        return schema.filter((arg: IArgument) => arg.required);
    }
}
