import Util from "../core/util";
import Pattern from "../core/pattern";
import {Message} from "discord.js";
import {PromiseOr} from "@atlas/xlib";
import {InputArgument} from "./command";

/**
 * Represents an argument resolver. Returns 'null' if processing failed.
 */
export type ArgumentResolver<T = any> = (input: InputArgument, message: Message) => PromiseOr<T | null>;

export type ArgumentType = TypeChecker | TypeCheckerGen;

export type TypeChecker = (input: string, message: Message) => PromiseOr<boolean>;

export type TypeCheckerGen = (...args: any[]) => TypeChecker;

export interface ITypeDef {
    /**
     * Represents a string.
     */
    readonly string: ArgumentType;

    /**
     * Represents a non-empty string.
     */
    readonly nonEmptyString: ArgumentType;

    /**
     * Represents an integer number. [-Infinity, Infinity].
     */
    readonly integer: ArgumentType;

    /**
     * Represents an unsigned integer, or a non-negative integer number. [0, Infinity].
     */
    readonly unsignedInteger: ArgumentType;

    /**
     * Represents a non-zero integer number. [-Infinity, -1, 1, Infinity].
     */
    readonly nonZeroInteger: ArgumentType;

    /**
     * Represents a positive integer number. [1, Infinity].
     */
    readonly positiveInteger: ArgumentType;

    /**
     * Represents a boolean value. Input will be parsed into a boolean.
     */
    readonly boolean: ArgumentType;

    /**
     * Represents an integer within a range.
     * @param {number} min The minimum value.
     * @param {number} max The maximum value.
     * @return {TypeChecker}
     */
    readonly minMax: ArgumentType;

    /**
     * Represents a Discord user ID or a Twitter Snoflake.
     */
    readonly snowflake: ArgumentType;

    /**
     * Represents a Discord guild member.
     */
    readonly member: ArgumentType;

    /**
     * Represents a Discord guild channel.
     */
    readonly channel: ArgumentType;

    /**
     * Represents a Discord guild member role.
     */
    readonly role: ArgumentType;

    /**
     * Represents a Discord bot token.
     */
    readonly botToken: ArgumentType;

    /**
     * Represents a date in the format dd/mm/yyyy.
     */
    readonly date: ArgumentType;

    /**
     * Represents a time string measurement unit along with the value.
     */
    readonly time: ArgumentType;

    /**
     * Argument must match all provided patterns.
     * @param {RegExp[]} patterns The patterns to test.
     * @return {TypeChecker}
     */
    readonly pattern: ArgumentType;

    /**
     * Implement custom type checker(s). All provided type checkers must return true in order for this rule to be met.
     * @param {TypeChecker[]} checkers
     * @return {TypeChecker}
     */
    readonly custom: ArgumentType;
}

export const Type: ITypeDef = {
    string: (input: string): boolean => {
        return typeof input === "string";
    },

    nonEmptyString: (input: string): boolean => {
        return typeof input === "string" && !Util.isEmpty(input);
    },

    integer: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num);
    },

    unsignedInteger: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num) && num >= 0;
    },

    nonZeroInteger: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num) && num !== 0;
    },

    positiveInteger: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num) && num >= 1;
    },

    boolean: (input: string): boolean => {
        return Pattern.positiveState.test(input) || Pattern.negativeState.test(input);
    },

    minMax(min: number, max: number): TypeChecker {
        return (input: string): boolean => {
            const num: number = parseInt(input);

            return !isNaN(num) && num >= min && num <= max;
        };
    },

    snowflake: (input: string): boolean => {
        return typeof input === "string" && Pattern.snowflake.test(input);
    },

    member: (input: string, msg: Message): boolean => {
        return typeof input === "string" && msg.guild && msg.guild.member(Util.resolveId(input)) !== undefined;
    },

    channel: (input: string, msg: Message): boolean => {
        return typeof input === "string" && msg.guild && msg.guild.channels.has(Util.resolveId(input));
    },

    role: (input: string, msg: Message): boolean => {
        return typeof input === "string" && msg.guild && msg.guild.roles.has(Util.resolveId(input));
    },

    botToken: (input: string): boolean => {
        return typeof input === "string" && Pattern.token.test(input);
    },

    date: (input: string): boolean => {
        return typeof input === "string" && Pattern.date.test(input);
    },

    time: (input: string): boolean => {
        return typeof input === "string" && Pattern.time.test(input);
    },

    pattern(...patterns: RegExp[]): TypeChecker {
        return (input: string): boolean => {
            for (const pattern of patterns) {
                if (!pattern.test(input)) {
                    return false;
                }
            }

            return true;
        };
    },

    custom(...checkers: TypeChecker[]): TypeChecker {
        return async (input: string, msg: Message): Promise<boolean> => {
            for (const checker of checkers) {
                if (!(await checker(input, msg))) {
                    return false;
                }
            }

            return true;
        };
    }
};
