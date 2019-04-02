import {GuildMember, Message, Role, Snowflake} from "discord.js";
import path from "path";
import Util from "../util/util";
import {ArgumentResolver, ArgumentType, type} from "../commands/type";
import Pattern from "./pattern";
import {InputArgument} from "../commands/command";
import {IBotOptions} from "./botExtra";

// TODO: Not working.
export const debugMode: boolean = process.env.MIX_DEBUG_MODE === "true";

export const title: string =

    "███╗   ███╗ ██╗ ██╗  ██╗\n" +
    "████╗ ████║ ██║ ╚██╗██╔╝\n" +
    "██╔████╔██║ ██║  ╚███╔╝\n" +
    "██║╚██╔╝██║ ██║  ██╔██╗\n" +
    "██║ ╚═╝ ██║ ██║ ██╔╝ ██╗ ██╗\n" +
    "╚═╝     ╚═╝ ╚═╝ ╚═╝  ╚═╝ ╚═╝ {version}";

export const basePath: string = path.resolve(path.join(".."));

export const internalFragmentsPath: string = path.resolve(path.join(__dirname, "..", "internal"));

// TODO: No longer required/used. Implement in the new Type rework system.
export const defaultArgResolvers: Map<ArgumentType, ArgumentResolver> = new Map([
    [type.member, (input: InputArgument, msg: Message): GuildMember | null => {
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
    [type.role, (input: InputArgument, msg: Message): Role | null | any => {
        // The input must be a Snowflake (string).
        if (typeof input !== "string") {
            return null;
        }

        const resolvedRole: Role | undefined = msg.guild.roles.get(Util.resolveId(input));

        return resolvedRole || null;
    }],
    [type.boolean, (input: InputArgument): boolean | null => {
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
    [type.snowflake, (input: InputArgument): Snowflake | null => {
        if (typeof input !== "string") {
            return null;
        }

        return Util.resolveId(input);
    }],
    [type.integer, (input: InputArgument): number | null => {
        if (typeof input !== "string") {
            return null;
        }

        const result: number = parseInt(input);

        return isNaN(result) ? null : result;
    }],
    [type.decimal, (input: InputArgument): number | null => {
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
export const defaultBotOptions: IBotOptions = {
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
export const trueDelegates: string[] = ["true", "1", "yes"];

/**
 * Entities representing the 'false' state.
 */
export const falseDelegates: string[] = ["false", "0", "no"];

/**
 * Common Discord botlist servers.
 */
export const botLists: ReadonlyMap<Snowflake, string> = new Map([
    ["374071874222686211", "botsfordiscord.com"],
    ["264445053596991498", "discordbots.org"],
    ["387812458661937152", "botlist.space"],
    ["483344253963993113", "automacord.xyz"],
    ["446425626988249089", "bots.ondiscord.xyz"],
    ["528352472389910529", "botsparadiscord.xyz"],
    ["112319935652298752", "carbonitex.net"],
    ["402400730922876930", "dankbotlist.com"],
    ["439866052684283905", "discord.boats"],
    ["421630709585805312", "discordboats.club"],
    ["450100127256936458", "discordbotlist.com"],
    ["500658335217876997", "discordbotreviews.xyz"],
    ["396440418507816960", "discordbot.world"],
    ["110373943822540800", "discord.bots.gg"],
    ["494311015484358687", "discordbotslist.us.to"],
    ["501017909389295616", "discordbots.fr"]
]);
