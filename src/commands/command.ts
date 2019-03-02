import {Message, RichEmbed} from "discord.js";

namespace Commands {
    export type CommandExeHandler<TArgs extends object = object, TReturn = any> = (context: Context, args: TArgs, api: any) => TReturn;

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
     * Limitations and restrictions by which the execution environment
     * and the command issuer must abide to.
     */
    export interface IConstraints {
        selfPermissions: any[];
        issuerPermissions: any[];
        environment: ChatEnv;
        auth: number;
        userGroups: RestrictGroup[];
        cooldown: number;
    }

    export const DefaultCommandRestrict: IConstraints = {
        auth: 0,
        cooldown: 0,
        environment: ChatEnv.Anywhere,
        issuerPermissions: [],
        selfPermissions: [],
        userGroups: []
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

    export interface IGenericCommand<T extends object = object> extends IFragment, IDisposable {
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

    export abstract class GenericCommand<T extends object = object> implements IGenericCommand<T> {
        public readonly meta: IMeta = {
            // Leave empty intentionally so the fragment validator complains.
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

    export abstract class Subcommand<T extends object = object> extends GenericCommand<T> {
        //
    }

    /**
     * Base command class. The 'meta.name' property must be set.
     */
    export abstract class Command<T extends object = object> extends GenericCommand<T> {
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
}
