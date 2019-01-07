import ChatEnv from "../core/chat-env";
import Context from "./command-context";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import {Message, RichEmbed} from "discord.js";
import Bot from "../core/bot";
import {IDisposable} from "../core/helpers";
import {PromiseOr} from "..";

export type UserGroup = string[];

export type CommandExeHandler<TArgs extends object = object, TReturn = any> = (context: Context, args: TArgs, api: any) => TReturn;

export enum RestrictGroup {
    ServerOwner,
    ServerModerator,
    BotOwner
}

export type DefaultValueResolver = (message: Message) => string;

export type ArgumentTypeChecker = (argument: string, message: Message) => boolean;

/**
 * TrivialArgType       : Internal check
 * RegExp               : Inline check
 * IArgumentTypeChecker : Provided type check by method
 */
export type ArgumentType = TrivialArgType | ArgumentTypeChecker | RegExp | string;

export interface ICustomArgType {
    readonly name: string;
    readonly check: ArgumentTypeChecker | RegExp;
}

export type RawArguments = Array<string | number | boolean>;

export type DefiniteArgument = string | number | boolean;

export enum TrivialArgType {
    String,
    Integer,
    UnsignedInteger,
    NonZeroInteger,
    Boolean
}

export enum InternalArgType {
    Snowflake = "snowflake",
    Member = "member",
    State = "state",
    Channel = "channel",
    Role = "role"
}

export interface IArgumentResolver {
    readonly name: string;
    readonly resolve: (argument: DefiniteArgument, message: Message) => any;
}

export interface IArgument {
    readonly name: string;
    readonly type: ArgumentType;
    readonly description?: string;
    readonly defaultValue?: DefiniteArgument | DefaultValueResolver;
    readonly required?: boolean;

    // TODO: CRTICAL: X2 : Must verify that the same short switch isn't already being used by another argument of the same command.
    readonly switchShortName?: string;
}

export interface IConstraints {
    selfPermissions: any[];
    issuerPermissions: any[];
    environment: ChatEnv;
    auth: number;
    specific: Array<string | RestrictGroup>;
    cooldown: number;
}

export const DefaultCommandRestrict: IConstraints = {
    auth: 0,
    cooldown: 0,
    environment: ChatEnv.Anywhere,
    issuerPermissions: [],
    selfPermissions: [],
    specific: []
};

export enum CommandStatus {
    OK = 0,
    Failed = 1
}

export interface ICommandResult {
    readonly responses: Array<string | RichEmbed>;
    readonly status: CommandStatus | number;
}

export interface IGenericCommand<T extends object = object> extends IFragment, IDisposable {
    undo(oldContext: Context, message: Message, args: T): PromiseOr<boolean>;
    enabled(): PromiseOr<boolean>;
    run(context: Context, args: T): ICommandResult | any;
    isExcluded(query: string): boolean;
    
    readonly minArguments: number;
    readonly maxArguments: number;
    readonly meta: IFragmentMeta;
    readonly aliases: string[];
    readonly arguments: IArgument[];
    readonly constraints: IConstraints;
    readonly exclude: string[];
    readonly singleArg: boolean;
    readonly isEnabled: boolean;
    readonly undoable: boolean;
}

export abstract class GenericCommand<T extends object = object> implements IGenericCommand<T> {
    public readonly abstract meta: IFragmentMeta;

    public readonly aliases: string[] = [];
    public readonly arguments: IArgument[] = [];
    public readonly constraints: IConstraints = Object.assign({}, DefaultCommandRestrict);
    public readonly exclude: string[] = [];
    public readonly singleArg: boolean = false;
    public readonly isEnabled: boolean = true;
    public readonly undoable: boolean = false;

    protected readonly bot: Bot;

    protected constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @protected
         * @readonly
         */
        this.bot = bot;
    }

    // TODO: Implement/shouldn't be negative response?
    public async undo(oldContext: Context, message: Message, args: T): Promise<boolean> {
        await message.reply("That action cannot be undone");

        return false;
    }

    public dispose(): void {
        //
    }

    /**
     * @return {boolean} Whether the command can be enabled
     */
    public async enabled(): Promise<boolean> {
        return true;
    }

    public abstract run(context: Context, args: T): ICommandResult | any;

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    public get minArguments(): number {
        return this.arguments.filter((arg: IArgument) => arg.required).length;
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
export abstract class Subcommand<T extends object = object> extends GenericCommand<T> {
    //
}

/**
 * @extends GenericCommand
 */
export default abstract class Command<T extends object = object> extends GenericCommand<T> {
    public readonly subcommands: Subcommand<T>[] = [];

    /**
     * @todo canExecute should default boolean, same concept as Service
     * @param {Context} context
     * @return {boolean} Whether this command may be executed
     */
    public canExecute(context: Context): boolean {
        return true;
    }
}
