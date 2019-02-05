import {GuildMember, Message, Role, Snowflake} from "discord.js";
import path from "path";
import {IBotEmojiOptions, IBotExtraOptions} from "./bot-extra";
import {ISettingsPaths} from "./settings";
import Util from "./util";
import {ArgumentResolver, ArgumentType, Type} from "../commands/type";
import Pattern from "./pattern";
import {InputArgument} from "../commands/command";

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

export const InternalFragmentsPath: string = path.resolve(path.join(__dirname, "..", "internal"));

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
    }]
]);

export const DefaultBotEmojiOptions: IBotEmojiOptions = {
    error: ":thinking:",
    success: ":white_check_mark:"
};

export const DefaultBotOptions: IBotExtraOptions = {
    allowCommandChain: true,
    asciiTitle: true,
    autoDeleteCommands: false,
    autoResetAuthStore: false,
    checkCommands: true,
    ignoreBots: true,
    updateOnMessageEdit: false,
    dmHelp: true,
    logMessages: false,
    consoleInterface: true,
    optimizer: false
};

export const DefaultSettingPaths: ISettingsPaths = {
    commands: "commands",
    plugins: "plugins",
    services: "services",
    languages: "languages",
    tasks: "tasks"
};

export const TrueDelegates: string[] = ["true", "1", "yes"];

export const FalseDelegates: string[] = ["false", "0", "no"];
