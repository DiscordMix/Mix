import Log from "../core/log";
import {IArgument} from "./command";

export interface IArgumentParser {
    resolve(type: string, arg: string, resolvers: object): TemplateStringsArray;
    getRequiredArguments(schema: IArgument[]): IArgument[];
}

/**
 * Utility class for parsing command arguments.
 */
export default class ArgumentParser {
    /**
     * @param {string} type
     * @param {string} arg
     * @param {object} resolvers
     * @return {*}
     */
    public resolve(type: string, arg: string, resolvers: object): TemplateStringsArray {
        const keys: string[] = Object.keys(resolvers);

        for (const key of keys) {
            if (key === type) {
                return resolvers[key](arg);
            }
        }

        throw Log.error(`Argument resolver not defined: ${type}`);
    }

    /**
     * @param {IArgument[]} schema
     * @return {IArgument[]}
     */
    public getRequiredArguments(schema: IArgument[]): IArgument[] {
        return schema.filter((arg: IArgument) => arg.required);
    }
}
