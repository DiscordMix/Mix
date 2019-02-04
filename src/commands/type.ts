import Util from "../core/util";
import Pattern from "../core/pattern";
import {Message} from "discord.js";
import {PromiseOr} from "@atlas/xlib";
import Log from "../core/log";

export type ArgumentType = TypeChecker | TypeCheckerGen;

export type TypeChecker = (input: string, message: Message) => PromiseOr<boolean>;

export type TypeCheckerGen = (...args: any[]) => TypeChecker;

export interface ITypeDef {
    [key: string]: ArgumentType;
}

export const Type: ITypeDef = {
    /**
     * Represents a string.
     */
    String: (input: string): boolean => {
        return typeof input === "string";
    },

    /**
     * Represents a non-empty string.
     */
    NonEmptyString: (input: string): boolean => {
        return typeof input === "string" && !Util.isEmpty(input);
    },

    /**
     * Represents an integer number. [-Infinity, Infinity].
     */
    Integer: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num);
    },

    /**
     * Represents an unsigned integer, or a non-negative integer number. [0, Infinity].
     */
    UnsignedInteger: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num) && num >= 0;
    },

    /**
     * Represents a non-zero integer number. [-Infinity, -1, 1, Infinity].
     */
    NonZeroInteger: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num) && num !== 0;
    },

    /**
     * Represents a positive integer number. [1, Infinity].
     */
    PositiveInteger: (input: string): boolean => {
        const num: number = parseInt(input);

        return !isNaN(num) && num >= 1;
    },

    /**
     * Represents a boolean value. Input will be parsed into a boolean.
     */
    Boolean: (input: string): boolean => {
        return Pattern.positiveState.test(input) || Pattern.negativeState.test(input);
    },

    /**
     * Represents an integer within a range.
     * @param {number} min The minimum value.
     * @param {number} max The maximum value.
     * @return {TypeChecker}
     */
    MinMax(min: number, max: number): TypeChecker {
        return (input: string): boolean => {
            const num: number = parseInt(input);

            return !isNaN(num) && num >= min && num <= max;
        };
    },

    /**
     * Represents a Discord user ID or a Twitter Snoflake.
     */
    Snowflake: (input: string): boolean => {
        return typeof input === "string" && Pattern.snowflake.test(input);
    },

    /**
     * Represents a Discord guild member.
     */
    Member: (input: string, msg: Message): boolean => {
        return typeof input === "string" && msg.guild && msg.guild.member(Util.resolveId(input)) !== undefined;
    },

    /**
     * Represents a Discord guild channel.
     */
    Channel: (input: string, msg: Message): boolean => {
        return typeof input === "string" && msg.guild && msg.guild.channels.has(Util.resolveId(input));
    },

    /**
     * Represents a Discord guild member role.
     */
    Role: (input: string, msg: Message): boolean => {
        return typeof input === "string" && msg.guild && msg.guild.roles.has(Util.resolveId(input));
    },

    /**
     * Represents a Discord bot token.
     */
    BotToken: (input: string): boolean => {
        return typeof input === "string" && Pattern.token.test(input);
    },

    /**
     * Represents a date in the format dd/mm/yyyy.
     */
    Date: (input: string): boolean => {
        return typeof input === "string" && Pattern.date.test(input);
    },

    /**
     * Represents a time string measurement unit along with the value.
     */
    Time: (input: string): boolean => {
        return typeof input === "string" && Pattern.time.test(input);
    },

    /**
     * Argument must match all provided patterns.
     * @param {RegExp[]} patterns The patterns to test.
     * @return {TypeChecker}
     */
    Pattern(...patterns: RegExp[]): TypeChecker {
        return (input: string): boolean => {
            for (const pattern of patterns) {
                if (!pattern.test(input)) {
                    return false;
                }
            }

            return true;
        };
    },

    /**
     * Implement custom type checker(s). All provided type checkers must return true in order for this rule to be met.
     * @param {TypeChecker[]} checkers
     * @return {TypeChecker}
     */
    Custom(...checkers: TypeChecker[]): TypeChecker {
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
