import path from "path";
import {DefiniteArgument, IArgumentResolver, InternalArgType, ICustomArgType} from "../commands/command";
import {Message, GuildMember, Role, Snowflake} from "discord.js";
import Patterns from "./patterns";
import Utils from "./utils";
import {IBotEmojiOptions, IBotExtraOptions} from "./bot-extra";
import {ISettingsPaths} from "./settings";

// TODO: Not working
export const DebugMode: boolean = process.env.FORGE_DEBUG_MODE == "true";

export const Title: string =

    "███████╗ ██████╗ ██████╗  ██████╗ ███████╗\n" +
    "██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝\n" +
    "█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  \n" +
    "██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  \n" +
    "██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗\n" +
    "╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝ {version}";

export const BasePath: string = path.resolve(path.join(".."));

export const InternalFragmentsPath: string = path.resolve(path.join(__dirname, "../fragments/internal"));

// TODO: Merge this resolvers with the (if provided) provided
// ones by the user.
export const InternalArgResolvers: IArgumentResolver[] = [
    {
        name: InternalArgType.Member,

        resolve(arg: DefiniteArgument, message: Message): GuildMember | null {
            const resolvedMember: GuildMember = message.guild.member(Utils.resolveId(arg.toString()));

            if (resolvedMember) {
                return resolvedMember;
            }

            return null;
        }
    },
    {
        name: InternalArgType.Role,

        resolve(arg: DefiniteArgument, message: Message): Role | null {
            const resolvedRole: Role | undefined = message.guild.roles.get(Utils.resolveId(arg.toString()));

            if (resolvedRole) {
                return resolvedRole;
            }

            return null;
        }
    },
    {
        name: InternalArgType.State,

        resolve(arg: DefiniteArgument): boolean {
            return Utils.translateState(arg.toString());
        }
    },
    {
        name: InternalArgType.Snowflake,

        resolve(arg: DefiniteArgument): Snowflake {
            return Utils.resolveId(arg.toString());
        }
    }
];

// TODO: Message type and resolver
export const InternalArgTypes: ICustomArgType[] = [
    {
        name: InternalArgType.Channel,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.channels.has(Utils.resolveId(arg));
        }
    },
    {
        name: InternalArgType.Member,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.member(Utils.resolveId(arg)) !== undefined;
        }
    },
    {
        name: InternalArgType.Role,

        check(arg: string, message: Message): boolean {
            return message.guild && message.guild.roles.has(Utils.resolveId(arg));
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
    success: ":white_check_mark:",
    error: ":thinking:"
};

export const DefaultBotOptions: IBotExtraOptions = {
    allowCommandChain: true,
    autoDeleteCommands: false,
    checkCommands: true,
    ignoreBots: true,
    updateOnMessageEdit: false,
    asciiTitle: true,
    autoResetAuthStore: false,
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