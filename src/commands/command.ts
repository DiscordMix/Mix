import DiscordChatEnv from "../core/discord-chat-env";
import DiscordContext, {IDiscordContext} from "./command-context";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import {Message, RichEmbed} from "discord.js";
import DiscordBot from "../bots/discord-bot";
import {IDisposable} from "../core/helpers";
import {PromiseOr} from "@atlas/xlib";

export type UserGroup = string[];

export type CommandExeHandler<TArgs extends object = object, TReturn = any> = (context: DiscordContext, args: TArgs, api: any) => TReturn;

export enum RestrictGroup {
    ServerOwner,
    ServerModerator,
    BotOwner
}

export type DefaultValueResolver = (message: Message) => string;

export type ArgumentTypeChecker = (argument: string, message: Message) => boolean;

/**
 * Type                 : Internal check
 * RegExp               : Inline check
 * IArgumentTypeChecker : Provided type check by method
 */
export type ArgumentType = Type | ArgumentTypeChecker | RegExp | string;

export interface ICustomArgType {
    readonly name: string;
    readonly check: ArgumentTypeChecker | RegExp;
}

export type RawArguments = Array<string | number | boolean>;

export type DefiniteArgument = string | number | boolean;

export enum Type {
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

export type SpecificConstraints = Array<string | RestrictGroup>;

export interface IConstraints {
    selfPermissions: any[];
    issuerPermissions: any[];
    environment: DiscordChatEnv;
    auth: number;
    specific: SpecificConstraints;
    cooldown: number;
}

export const DefaultCommandRestrict: IConstraints = {
    auth: 0,
    cooldown: 0,
    environment: DiscordChatEnv.Anywhere,
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

export type CommandRunner<T = ICommandResult | any> = (context: IDiscordContext, args: any) => T;

export type CommandRelay<T = any> = (context: DiscordContext, args: T, command: IGenericCommand) => void;

export type CommandGuard<T = any> = (context: DiscordContext, args: T, command: IGenericCommand) => boolean;

export interface IGenericCommand<T extends object = object> extends IFragment, IDisposable {
    readonly minArguments: number;
    readonly maxArguments: number;
    readonly meta: IFragmentMeta;
    readonly aliases: string[];
    readonly args: IArgument[];
    readonly constraints: IConstraints;
    readonly exclude: string[];
    readonly singleArg: boolean;
    readonly isEnabled: boolean;
    readonly undoable: boolean;
    readonly connections: CommandRelay[];
    readonly dependsOn: string[];
    readonly guards: CommandGuard[];

    undo(oldContext: DiscordContext, message: Message, args: T): PromiseOr<boolean>;
    enabled(): PromiseOr<boolean>;
    run(context: DiscordContext, args: T): ICommandResult | any;
    isExcluded(query: string): boolean;
}

export abstract class GenericCommand<T extends object = object> implements IGenericCommand<T> {
    public readonly meta: IFragmentMeta = {
        // Leave empty intentionally so the fragment validator complains
        name: ""
    };

    public readonly aliases: string[] = [];
    public readonly args: IArgument[] = [];
    public readonly constraints: IConstraints = Object.assign({}, DefaultCommandRestrict);
    public readonly exclude: string[] = [];
    public readonly singleArg: boolean = false;
    public readonly isEnabled: boolean = true;
    public readonly undoable: boolean = false;
    public readonly connections: CommandRelay[] = [];
    public readonly dependsOn: string[] = [];
    public readonly guards: CommandGuard[] = [];

    protected readonly bot: DiscordBot;

    protected constructor(bot: DiscordBot) {
        /**
         * @type {DiscordBot}
         * @protected
         * @readonly
         */
        this.bot = bot;
    }

    // TODO: Implement/shouldn't be negative response?
    public async undo(oldContext: DiscordContext, message: Message, args: T): Promise<boolean> {
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

    public abstract run(context: DiscordContext, args: T): ICommandResult | any;

    /**
     * @return {number} The minimum amount of required arguments that this command accepts
     */
    public get minArguments(): number {
        return this.args.filter((arg: IArgument) => arg.required).length;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts
     */
    public get maxArguments(): number {
        return this.args.length;
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
 * Base command class. The 'meta.name' property must be set.
 * @extends GenericCommand
 */
export default abstract class Command<T extends object = object> extends GenericCommand<T> {
    public readonly subcommands: Subcommand<T>[] = [];

    /**
     * @todo canExecute should default boolean, same concept as Service
     * @param {DiscordContext} context
     * @return {boolean} Whether this command may be executed
     */
    public canExecute(context: DiscordContext): boolean {
        return true;
    }
}
