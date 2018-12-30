import Log from "../core/log";
import {IArgument} from "./command";

export interface IArgumentParser {
    resolve<T = any>(type: string, arg: string, resolvers: object): TemplateStringsArray;
    getRequiredArguments(schema: IArgument[]): IArgument[];
}

export default class ArgumentParser {
    /**
     * @param {string} type
     * @param {string} arg
     * @param {object} resolvers
     * @return {*}
     */
    public resolve<T = any>(type: string, arg: string, resolvers: object): TemplateStringsArray {
        const keys: string[] = Object.keys(resolvers);

        for (let i: number = 0; i < keys.length; i++) {
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
    public getRequiredArguments(schema: IArgument[]): IArgument[] {
        return schema.filter((arg: IArgument) => arg.required);
    }
}
