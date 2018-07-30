import ChatEnvironment from "../core/chat-environment";
import CommandContext from "./command-context";
import Fragment from "../fragments/fragment";
import { Message } from "discord.js";

export type UserGroup = Array<string>;

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
    WholeNumber,
    NonZeroWholeNumber,
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
    readonly defaultValue?: any;
    readonly required?: boolean;
}

export interface CommandRestrict {
    selfPermissions: Array<any>;
    issuerPermissions: Array<any>;
    environment: ChatEnvironment;
    auth: number;
    specific: Array<string>;
    cooldown: number;
}

/**
 * @extends Fragment
 */
export default abstract class Command extends Fragment {
    readonly aliases: Array<string> = [];
    readonly arguments: Array<CommandArgument> = [];
    readonly isEnabled: boolean = true;
    readonly exclude: Array<string> = [];
    readonly singleArg: boolean = false;

    readonly restrict: CommandRestrict = {
        auth: 0,
        cooldown: 0,
        environment: ChatEnvironment.Anywhere,
        issuerPermissions: [],
        selfPermissions: [],
        specific: []
    };

    /**
     * @param {CommandOptions} options
     */
    constructor() {
        super();
    }

    abstract executed(context: CommandContext, args: any, api: any): any;

    canExecute(context: CommandContext): boolean {
        return true;
    }

    /**
     * @param {string} query
     * @return {boolean} Whether the query is excluded
     */
    isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    get minArguments(): number {
        let counter = 0;

        for (let i: number = 0; i < this.arguments.length; i++) {
            if (this.arguments[i].required) {
                counter++;
            }
        }

        return counter;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts
     */
    get maxArguments(): number {
        return this.arguments.length;
    }
}
