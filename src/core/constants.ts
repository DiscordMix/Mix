import {GuildMember, Message, Role, Snowflake} from "discord.js";
import path from "path";
import {DefiniteArgument, IArgumentResolver, ICustomArgType, InternalArgType} from "../commands/command";
import {IBotEmojiOptions, IBotExtraOptions} from "./bot-extra";
import Patterns from "./patterns";
import {ISettingsPaths} from "./settings";
import Util from "./util";

// TODO: Not working
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

// TODO: Merge this resolvers with the (if provided) provided
// ones by the user.
export const ArgResolvers: IArgumentResolver[] = [
    {
        name: InternalArgType.Member,

        resolve(arg: DefiniteArgument, message: Message): GuildMember | null {
            const resolvedMember: GuildMember = message.guild.member(Util.resolveId(arg.toString()));

            if (resolvedMember) {
                return resolvedMember;
            }

            return null;
        }
    },
    {
        name: InternalArgType.Role,

        resolve(arg: DefiniteArgument, message: Message): Role | null {
            const resolvedRole: Role | undefined = message.guild.roles.get(Util.resolveId(arg.toString()));

            if (resolvedRole) {
                return resolvedRole;
            }

            return null;
        }
    },
    {
        name: InternalArgType.State,

        resolve(arg: DefiniteArgument): boolean {
            return Util.translateState(arg.toString());
        }
    },
    {
        name: InternalArgType.Snowflake,

        resolve(arg: DefiniteArgument): Snowflake {
            return Util.resolveId(arg.toString());
        }
    }
];

// TODO: Message type and resolver
export const ArgTypes: ICustomArgType[] = [
    {
        name: InternalArgType.Channel,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.channels.has(Util.resolveId(arg));
        }
    },
    {
        name: InternalArgType.Member,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.member(Util.resolveId(arg)) !== undefined;
        }
    },
    {
        name: InternalArgType.Role,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.roles.has(Util.resolveId(arg));
        }
    },
    {
        name: InternalArgType.Snowflake,
        check: Patterns.mentionOrSnowflake
    },
    {
        name: InternalArgType.State,
        check: Patterns.state
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
    emojis: DefaultBotEmojiOptions,
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
