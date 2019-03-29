import ChatEnv from "../core/chatEnv";
import Context, {IContext} from "./context";
import {IFragment, IMeta} from "../fragments/fragment";
import {Message, RichEmbed} from "discord.js";
import Bot from "../core/bot";
import {IDisposable, Writeable} from "../util/helpers";
import {PromiseOr} from "@atlas/xlib";
import {TypeChecker, ArgumentType} from "./type";

export type CommandExeHandler<TArgs extends {} = {}, TReturn = any> = (context: Context, args: TArgs, api: any) => TReturn;

/**
 * Restriction to common Discord groups.
 */
export enum RestrictGroup {
    ServerOwner,
    ServerModerator,
    BotOwner
}

export type DefaultValueResolver = (message: Message) => string;

export interface ICustomArgType {
    readonly name: string;
    readonly check: TypeChecker | RegExp;
}

/**
 * An array of input arguments.
 */
export type RawArguments = string[];

/**
 * Represents a simple argument with an unresolved value.
 */
export type InputArgument = string | number | boolean;

export interface IArgument {
    readonly name: string;
    readonly type: ArgumentType;
    readonly description?: string;
    readonly defaultValue?: InputArgument | DefaultValueResolver;
    readonly required?: boolean;

    // TODO: CRTICAL: X2 : Must verify that the same short flag isn't already being used by another argument of the same command.
    readonly flagShortName?: string;
}

/**
 * Possible string keys for constraints.
 */
export enum ConstraintProp {
    SelfPermissions = "selfPermissions",
    IssuerPermissions = "issuerPermissions",
    Environment = "environment",
    Auth = "auth",
    UserGroups = "userGroups",
    Cooldown = "cooldown"
}

/**
 * Limitations and restrictions by which the execution environment
 * and the command issuer must abide to.
 */
export interface IConstraints {
    [ConstraintProp.SelfPermissions]: any[];
    [ConstraintProp.IssuerPermissions]: any[];
    [ConstraintProp.Environment]: ChatEnv;
    [ConstraintProp.Auth]: number;
    [ConstraintProp.UserGroups]: RestrictGroup[];
    [ConstraintProp.Cooldown]: number;
}

/**
 * Default command constraints which will be merged
 * with provided constraints.
 */
export const defaultCommandConstraints: IConstraints = {
    [ConstraintProp.Auth]: 0,
    [ConstraintProp.Cooldown]: 0,
    [ConstraintProp.Environment]: ChatEnv.Anywhere,
    [ConstraintProp.IssuerPermissions]: [],
    [ConstraintProp.SelfPermissions]: [],
    [ConstraintProp.UserGroups]: []
};

/**
 * Represents a command exeuction result status.
 */
export enum CommandStatus {
    /**
     * The command executed successfully.
     */
    OK,

    /**
     * The command execution failed.
     */
    Failed
}

export interface ICommandResult {
    readonly responses: Array<string | RichEmbed>;
    readonly status: CommandStatus | number;
}

export type CommandRunner<T = ICommandResult | any> = (context: IContext, args: any) => T;

export type CommandRelay<T = any> = (context: Context, args: T, command: IGenericCommand) => void;

/**
 * Represents a command middleware function that will determine whether the command execution sequence may continue.
 */
export type CommandGuard<T = any> = (context: Context, args: T, command: IGenericCommand) => boolean;

export interface IGenericCommand<T extends {} = {}> extends IFragment, IDisposable {
    readonly minArguments: number;
    readonly maxArguments: number;
    readonly meta: IMeta;
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

    undo(oldContext: Context, message: Message, args: T): PromiseOr<boolean>;
    enabled(): PromiseOr<boolean>;
    run(context: Context, args: T): ICommandResult | any;
    isExcluded(query: string): boolean;
}

export abstract class GenericCommand<T extends {} = {}> implements IGenericCommand<T> {
    public readonly meta: IMeta = {
        // Leave empty intentionally so the fragment validator complains.
        name: ""
    };

    /**
     * Different aliases which the command can be
     * identified by.
     */
    public readonly aliases: string[] = [];

    /**
     * The arguments accepted and processed by the command.
     */
    public readonly args: IArgument[] = [];

    /**
     * Limitations and restrictions by which the execution environment
     * and the command issuer must abide to.
     */
    public readonly constraints: IConstraints = Object.assign({}, defaultCommandConstraints);

    /**
     * Specific environments on which the command is not
     * allowed to execute.
     */
    public readonly exclude: string[] = [];

    /**
     * Whether the command merges all provided arguments
     * into a single argument.
     */
    public readonly singleArg: boolean = false;

    /**
     * Whether the command is enabled and may be interacted
     * with.
     */
    public readonly isEnabled: boolean = true;

    /**
     * Whether the command provides the functionality to
     * undo its actions.
     */
    public readonly undoable: boolean = false;

    /**
     * Callback listeners invoked upon the command being
     * executed.
     */
    public readonly connections: CommandRelay[] = [];

    /**
     * Middleware functions that determine whether the command
     * can execute.
     */
    public readonly guards: CommandGuard[] = [];

    /**
     * Dependencies that must be present for the command to
     * be enabled.
     */
    public readonly dependsOn: string[] = [];

    protected readonly bot: Bot;

    protected constructor(bot: Bot) {
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
     * @return {Promise<boolean>} Whether the command can be enabled.
     */
    public async enabled(): Promise<boolean> {
        return true;
    }

    public abstract run(context: Context, args: T): ICommandResult | any;

    /**
     * @return {number} The minimum amount of required arguments that this command accepts.
     */
    public get minArguments(): number {
        return this.args.filter((arg: IArgument) => arg.required).length;
    }

    /**
     * @return {number} The maximum amount of arguments that this command accepts.
     */
    public get maxArguments(): number {
        return this.args.length;
    }

    /**
     * @return {boolean} Whether the query is excluded.
     */
    public isExcluded(query: string): boolean {
        return this.exclude.includes(query);
    }
}

export abstract class Subcommand<T extends {} = {}> extends GenericCommand<T> {
    //
}

/**
 * Base command class. The 'meta.name' property must be set.
 */
export default abstract class Command<T extends {} = {}> extends GenericCommand<T> {
    public readonly subcommands: Subcommand<T>[] = [];

    // TODO: Finish implementing. Use this.arg similar to React this.state/props.
    protected readonly arg: T = {};

    /**
     * Prepare the arguments for the command
     * execution event.
     */
    public setArgs(arg: T): this {
        (this.arg as Writeable<T>) = arg;

        return this;
    }

    // TODO: canExecute should default boolean, same concept as Service.
    /**
     * @param {Context} context
     * @return {boolean} Whether this command may be executed.
     */
    public canExecute(context: Context): boolean {
        return true;
    }
}
