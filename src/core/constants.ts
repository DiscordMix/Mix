import {GuildMember, Message, Role, Snowflake} from "discord.js";
import path from "path";
import {DefiniteArgument, IArgumentResolver} from "../commands/command";
import {IBotEmojiOptions, IBotExtraOptions} from "./bot-extra";
import {ISettingsPaths} from "./settings";
import Util from "./util";

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

export const InternalFragmentsPath: string = path.resolve(path.join(__dirname, "../fragments/internal"));

// TODO: No longer required/used. Implement in the new Type rework system.
export const ArgResolvers: IArgumentResolver[] = [
    {
        name: "member",

        resolve(arg: DefiniteArgument, message: Message): GuildMember | null {
            const resolvedMember: GuildMember = message.guild.member(Util.resolveId(arg.toString()));

            if (resolvedMember) {
                return resolvedMember;
            }

            return null;
        }
    },
    {
        name: "role",

        resolve(arg: DefiniteArgument, message: Message): Role | null {
            const resolvedRole: Role | undefined = message.guild.roles.get(Util.resolveId(arg.toString()));

            if (resolvedRole) {
                return resolvedRole;
            }

            return null;
        }
    },
    {
        name: "state",

        resolve(arg: DefiniteArgument): boolean {
            return Util.translateState(arg.toString());
        }
    },
    {
        name: "snowflake",

        resolve(arg: DefiniteArgument): Snowflake {
            return Util.resolveId(arg.toString());
        }
    }
];

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
