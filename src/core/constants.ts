import {GuildMember, Message, Role, Snowflake} from "discord.js";
import path from "path";
import Util from "./util";
import {ArgumentResolver, ArgumentType, Type} from "../commands/type";
import Pattern from "./pattern";
import {InputArgument} from "../commands/command";
import {IBotOptions} from "./botExtra";

// TODO: Not working.
export const DebugMode: boolean = process.env.MIX_DEBUG_MODE === "true";

export const Title: string =

    "███╗   ███╗ ██╗ ██╗  ██╗\n" +
    "████╗ ████║ ██║ ╚██╗██╔╝\n" +
    "██╔████╔██║ ██║  ╚███╔╝\n" +
    "██║╚██╔╝██║ ██║  ██╔██╗\n" +
    "██║ ╚═╝ ██║ ██║ ██╔╝ ██╗ ██╗\n" +
    "╚═╝     ╚═╝ ╚═╝ ╚═╝  ╚═╝ ╚═╝ {version}";

export const BasePath: string = path.resolve(path.join(".."));

export const InternalFragmentsPath: string = path.resolve(path.join(__dirname, "..", "Internal"));

// TODO: No longer required/used. Implement in the new Type rework system.
export const DefaultArgResolvers: Map<ArgumentType, ArgumentResolver> = new Map([
    [Type.member, (input: InputArgument, msg: Message): GuildMember | null => {
        // The input must be a Snowflake (string).
        if (typeof input !== "string") {
            return null;
        }

        const resolvedMember: GuildMember = msg.guild.member(Util.resolveId(input));

        if (resolvedMember) {
            return resolvedMember;
        }

        return null;
    }],
    // TODO: Complaining without the ending '| any'.
    [Type.role, (input: InputArgument, msg: Message): Role | null | any => {
        // The input must be a Snowflake (string).
        if (typeof input !== "string") {
            return null;
        }

        const resolvedRole: Role | undefined = msg.guild.roles.get(Util.resolveId(input));

        return resolvedRole || null;
    }],
    [Type.boolean, (input: InputArgument): boolean | null => {
        // Input is not a string, so fail right away.
        if (typeof input !== "string") {
            return null;
        }
        // Check if input matches positive state 'true'.
        else if (Pattern.positiveState.test(input)) {
            return true;
        }
        // Otherwise, check if input matches negative state 'false'.
        else if (Pattern.negativeState.test(input)) {
            return false;
        }

        // Input was never a 'false' or 'true' string variant representation.
        return null;
    }],
    [Type.snowflake, (input: InputArgument): Snowflake | null => {
        if (typeof input !== "string") {
            return null;
        }

        return Util.resolveId(input);
    }],
    [Type.integer, (input: InputArgument): number | null => {
        if (typeof input !== "string") {
            return null;
        }

        const result: number = parseInt(input);

        return isNaN(result) ? null : result;
    }],
    [Type.decimal, (input: InputArgument): number | null => {
        if (typeof input !== "string") {
            return null;
        }

        const result: number = parseFloat(input);

        return isNaN(result) ? null : result;
    }]
]);

/**
 * Default bot options which may be overriden by the user.
 */
export const DefaultBotOptions: IBotOptions = {
    allowCommandChain: true,
    showAsciiTitle: true,
    autoDeleteCommands: false,
    checkCommands: true,
    ignoreBots: true,
    updateOnMessageEdit: false,
    dmHelp: true,
    logMessages: false,
    useConsoleInterface: true,
    useOptimizer: false,
    keys: {},
    argumentResolvers: new Map(),
    argumentTypes: [],
    internalCommands: [],
    languages: [],
    owner: undefined,
    prefixes: ["!"],
    usePrefixCommand: true,

    paths: {
        commands: "commands",
        services: "services",
        languages: "languages",
        tasks: "tasks"
    }
};

/**
 * Entities representing the 'true' state.
 */
export const TrueDelegates: string[] = ["true", "1", "yes"];

/**
 * Entities representing the 'false' state.
 */
export const FalseDelegates: string[] = ["false", "0", "no"];
