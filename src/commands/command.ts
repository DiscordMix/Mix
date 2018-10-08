import ChatEnvironment from "../core/chat-environment";
import Context from "./command-context";
import Fragment from "../fragments/fragment";
import {Message} from "discord.js";

export type UserGroup = string[];

export type CommandExecuted = (context: Context, args: any, api: any) => any;

export enum RestrictGroup {
    ServerOwner,
    ServerModerator,
    BotOwner
}

export enum CommandAuth {
    Default = 0,
    Owner = -1
}

export enum ArgumentStyle {
    Explicit,
    Descriptive
}

export type DefaultValueResolver = (message: Message) => string;

export type ArgumentTypeChecker = (argument: string, message: Message) => boolean;

/**
 * PrimitiveArgType : Internal check
 * RegExp                : Inline check
 * ArgumentTypeChecker   : Provided type check by method
 */
export type ArgumentType = PrimitiveArgType | ArgumentTypeChecker | RegExp | string;

export interface CustomArgType {
    readonly name: string;
    readonly check: ArgumentTypeChecker | RegExp;
}

export type RawArguments = string[];

export enum PrimitiveArgType {
    String,
    Integer,
    UnsignedInteger,
    NonZeroInteger,
    Boolean
}

export interface ArgumentResolver {
    readonly name: string;
    readonly resolve: (argument: string, message: Message) => any;
}

// TODO: Make use of this
export interface Argument {
    readonly name: string;
    readonly type: ArgumentType;
    readonly description?: string;
    readonly defaultValue?: string | number | DefaultValueResolver;
    readonly required?: boolean;
}

export interface CommandRestrict {
    selfPermissions: any[];
    issuerPermissions: any[];
    environment: ChatEnvironment;
    auth: number;
    specific: Array<string | RestrictGroup>;
    cooldown: number;
}

export const DefaultCommandRestrict: CommandRestrict = {
    auth: 0,
    cooldown: 0,
    environment: ChatEnvironment.Anywhere,
    issuerPermissions: [],
    selfPermissions: [],
    specific: []
}

export type CommandSwitchInfo = {
    readonly name: string;
    readonly shorthand: string | null;
}

/**
 * @extends Fragment
 */
export abstract class GenericCommand extends Fragment {
    public readonly aliases: string[] = [];
    public readonly arguments: Argument[] = [];
    public readonly restrict: CommandRestrict = Object.assign({}, DefaultCommandRestrict);
    public readonly switches: Array<CommandSwitchInfo> = [];
    public readonly exclude: string[] = [];
    public readonly singleArg: boolean = false;
    public readonly isEnabled: boolean = true;

    public abstract executed(context: Context, args: any, api: any): any;

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    public get minArguments(): number {
        return this.arguments.filter((arg: Argument) => arg.required).length;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts
     */
    public get maxArguments(): number {
        return this.arguments.length;
    }

    /**
     * @param {string} query
     * @return {boolean} Whether the query is excluded
     */
    public isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }
}

/**
 * @extends GenericCommand
 */
export abstract class Subcommand extends GenericCommand {
    //
}

/**
 * @extends GenericCommand
 */
export default abstract class Command extends GenericCommand {
    public readonly subcommands: Array<Subcommand> = [];

    /**
     * @todo canExecute should default boolean, same concept as Service
     * @param {Context} context
     * @return {boolean} Whether this command may be executed
     */
    public canExecute(context: Context): boolean {
        return true;
    }
}
