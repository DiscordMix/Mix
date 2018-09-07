import ChatEnvironment from "../core/chat-environment";
import CommandContext from "./command-context";
import Fragment from "../fragments/fragment";
import {Message} from "discord.js";

export type UserGroup = Array<string>;

export enum CommandAuth {
    Default = 0,
    Owner = -1
}

export enum CommandArgumentStyle {
    Explicit,
    Descriptive
}

export type ArgumentTypeChecker = (argument: string, message: Message) => boolean;

/**
 * PrimitiveArgumentType : Internal check
 * RegExp                : Inline check
 * ArgumentTypeChecker   : Provided type check by method
 */
export type ArgumentType = PrimitiveArgumentType | ArgumentTypeChecker | RegExp | string;

export interface UserDefinedArgType {
    readonly name: string;
    readonly check: ArgumentTypeChecker | RegExp;
}

export type RawArguments = Array<string>;

export enum PrimitiveArgumentType {
    String,
    Integer,
    UnsignedInteger,
    NonZeroInteger,
    Boolean
}

export interface CommandArgumentResolver {
    readonly name: string;
    readonly resolve: (argument: string, message: Message) => any;
}

// TODO: Make use of this
export interface CommandArgument {
    readonly name: string;
    readonly type: ArgumentType;
    readonly description?: string;
    readonly defaultValue?: string | ((message: Message) => string);
    readonly required?: boolean;
}

export interface CommandRestrict {
    selfPermissions: Array<any>;
    issuerPermissions: Array<any>;
    environment: ChatEnvironment;
    auth: number;
    specific: Array<string>;
    cooldown: number;
    ownerOnly: boolean;
}

/**
 * @extends Fragment
 */
export default abstract class Command extends Fragment {
    public readonly aliases: Array<string> = [];
    public readonly arguments: Array<CommandArgument> = [];
    public readonly isEnabled: boolean = true;
    public readonly exclude: Array<string> = [];
    public readonly singleArg: boolean = false;

    public readonly restrict: CommandRestrict = {
        auth: 0,
        cooldown: 0,
        environment: ChatEnvironment.Anywhere,
        issuerPermissions: [],
        selfPermissions: [],
        specific: [],
        ownerOnly: false
    };

    /**
     * @param {CommandContext} context
     * @param {*} args
     * @param {*} api
     * @return {*}
     */
    public abstract executed(context: CommandContext, args: any, api: any): any;

    /**
     * @todo canExecute should default boolean, same concept as Service
     * @param {CommandContext} context
     * @return {boolean} Whether this command may be executed
     */
    public canExecute(context: CommandContext): boolean {
        return true;
    }

    /**
     * @param {string} query
     * @return {boolean} Whether the query is excluded
     */
    public isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    public get minArguments(): number {
        return this.arguments.filter((arg: CommandArgument) => arg.required).length;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts
     */
    public get maxArguments(): number {
        return this.arguments.length;
    }
}
