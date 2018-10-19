import ChatEnvironment from "../core/chat-environment";
import Context from "./command-context";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import {Message, RichEmbed} from "discord.js";
import CommandContext from "./command-context";
import {Bot} from "..";

export type IUserGroup = string[];

export type ICommandExecuted = (context: Context, args: any, api: any) => any;

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

export type IDefaultValueResolver = (message: Message) => string;

export type IArgumentTypeChecker = (argument: string, message: Message) => boolean;

/**
 * PrimitiveArgType      : Internal check
 * RegExp                : Inline check
 * IArgumentTypeChecker   : Provided type check by method
 */
export type IArgumentType = PrimitiveArgType | IArgumentTypeChecker | RegExp | string;

export type ICustomArgType = {
    readonly name: string;
    readonly check: IArgumentTypeChecker | RegExp;
}

export type IRawArguments = string[];

export enum PrimitiveArgType {
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

export type ArgumentResolver = {
    readonly name: string;
    readonly resolve: (argument: string, message: Message) => any;
}

// TODO: Make use of this
export type Argument = {
    readonly name: string;
    readonly type: IArgumentType;
    readonly description?: string;
    readonly defaultValue?: string | number | IDefaultValueResolver;
    readonly required?: boolean;
}

export type CommandRestrict = {
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
};

export type ICommandSwitchInfo = {
    readonly name: string;
    readonly shorthand: string | null;
}

export enum GenericCommandStatus {
    OK = 0,
    Failed = 1
}

export type ICommandResult = {
    readonly responses: Array<string | RichEmbed>;
    readonly status: GenericCommandStatus | number;
}

export abstract class GenericCommand<ArgumentsType> implements IFragment {
    public abstract meta: IFragmentMeta;
    public readonly aliases: string[] = [];
    public readonly arguments: Argument[] = [];
    public readonly restrict: CommandRestrict = Object.assign({}, DefaultCommandRestrict);
    public readonly switches: ICommandSwitchInfo[] = [];
    public readonly exclude: string[] = [];
    public readonly singleArg: boolean = false;
    public readonly isEnabled: boolean = true;
    public readonly undoable: boolean = false;


    private readonly bot: Bot;

    protected constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;
    }

    // TODO: Implement/shouldn't be negative response?
    public async undo(oldContext: CommandContext, message: Message, args: ArgumentsType): Promise<boolean> {
        await message.reply("That action cannot be undone");

        return false;
    }

    /**
     * @return {boolean} Whether the command can be enabled
     */
    public async enabled(): Promise<boolean> {
        return true;
    }

    public abstract executed(context: Context, args: ArgumentsType, api: any): ICommandResult | any;

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
export abstract class Subcommand<ArgumentsType> extends GenericCommand<ArgumentsType> {
    //
}

/**
 * @extends GenericCommand
 */
export default abstract class Command<ArgumentsType = any> extends GenericCommand<ArgumentsType> {
    public readonly subcommands: Subcommand<ArgumentsType>[] = [];

    /**
     * @todo canExecute should default boolean, same concept as Service
     * @param {Context} context
     * @return {boolean} Whether this command may be executed
     */
    public canExecute(context: Context): boolean {
        return true;
    }
}
