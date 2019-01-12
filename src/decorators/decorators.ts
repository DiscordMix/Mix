import "reflect-metadata";

import {Snowflake} from "discord.js";
import {CommandExeHandler, IArgument, IConstraints, SpecificConstraints} from "../commands/command";
import Log from "../core/log";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import ChatEnv from "../core/chat-env";

export enum DiscordEvent {
    Message = "message",
    ChannelCreated = "channelCreate",
    ChannelDeleted = "channelDelete",
    ChannelPinsUpdated = "channelPinsUpdate",
    ChannelUpdated = "channelUpdate",
    ClientUserGuildSettingsUpdated = "clientUserGuildSettingsUpdate",
    ClientUserSettingsUpdated = "clientUserSettingsUpdate",
    Disconnected = "disconnect",
    EmojiCreated = "emojiCreate",
    EmojiDeleted = "emojiDelete",
    EmojiUpdated = "emojiUpdate",
    Error = "error",
    GuildBanAdded = "guildBanAdd",
    GuildBanRemoved = "guildBanRemove",
    GuildJoined = "guildCreate",
    GuildLeft = "guildDelete",
    GuildMemberJoined = "guildMemberAdd",
    GuildMemberAvailable = "guildMemberAvailable",
    GuildMemberLeft = "guildMemberRemove",
    GuildMembersChunk = "guildMembersChunk",
    GuildMemberSpeaking = "guildMemberSpeaking",
    GuildMemberUpdated = "guildMemberUpdate",
    GuildUnavailable = "guildUnavailable",
    GuildUpdated = "guildUpdate",
    MessageDeleted = "messageDelete",
    MessagesBulkDeleted = "messageDeletedBulk",
    MessageReactionAdded = "messageReactionAdd",
    MessageReactionRemoved = "messageReactionRemove",
    MessageReactionsRemoved = "messageReactionRemoveAll",
    MessageUpdated = "messageUpdate",
    PresenceUpdated = "presenceUpdate",
    RateLimit = "rateLimit",
    Ready = "ready",
    Reconnecting = "reconnecting",
    Resume = "resume",
    RoleCreated = "roleCreate",
    RoleDeleted = "roleDelete",
    RoleUpdated = "roleUpdate",
    TypingStarted = "typingStart",
    TypingStopped = "typingStop",
    UserNoteUpdated = "userNoteUpdate",
    UserUpdated = "userUpdate",
    VoiceStateUpdated = "voiceStateUpdate",
    Warn = "warn"
}

export interface IBotEvent {
    readonly name: string;
    readonly handler: any;
}

export const BotEvents: IBotEvent[] = [];
export const ChannelMessageEvents: IBotEvent[] = [];

export const DecoratorCommands: IDecoratorCommand[] = [];

// Maybe keep this for global static listeners?
// TODO: Find a better way, like use the start method instead to define listeners, since decorators are called on class definition NOT instanciation
export function on(eventName: DiscordEvent | string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value === undefined || descriptor.value === null) {
            throw new Error("[Decorators.on] Expecting handler (undefined or null)");
        }
        else if (typeof descriptor.value !== "function") {
            throw new Error(`[Decorators.on] Handler must be of type function, got '${typeof descriptor.value}' instead`);
        }

        BotEvents.push({
            handler: descriptor.value,
            name: eventName
        });
    };
}

export function message(channel: Snowflake) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value === undefined || descriptor.value === null) {
            throw new Error("[Decorators.message] Expecting handler (undefined or null)");
        }
        else if (typeof descriptor.value !== "function") {
            throw new Error(`[Decorators.message] Handler must be of type function, got '${typeof descriptor.value}' instead`);
        }

        ChannelMessageEvents.push({
            handler: descriptor.value,
            name: channel
        });
    };
}

export enum DecoratorCommandType {
    Simple,
    Weak
}

export interface IDecoratorCommand extends IFragment {
    readonly type: DecoratorCommandType;
}

export interface IWeakCommand extends IPartialWeakCommand {
    readonly executed: CommandExeHandler;
}

export interface IPartialWeakCommand extends IDecoratorCommand {
    readonly aliases?: string[];
    readonly restrict?: IConstraints;
    readonly arguments?: IArgument[];
}

export interface ISimpleCommand extends IDecoratorCommand {
    readonly executed: CommandExeHandler;
}

// options: command name | WeakCommand
export function command(options: string | IPartialWeakCommand, description?: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value === undefined) {
            throw Log.error("[Decorators.command] Expecting value for command decorator");
        }

        let finalCommand: IWeakCommand | ISimpleCommand | null = null;
        let type: DecoratorCommandType = DecoratorCommandType.Simple;

        if (typeof options === "string") {
            if (description === undefined) {
                // TODO: Log command name (if it's there)
                throw Log.error("[Decorators.command] Expecting command description");
            }

            (finalCommand as any).meta = {
                description,
                name: options
            };
        }
        else if (typeof options !== "object") {
            // TODO: Log command name (if it's there)
            throw Log.error("[Decorators.command] Invalid type of input, expecting either string or object");
        }
        else if (typeof options === "object" && options !== null && description !== undefined) {
            // TODO: Log command name (if it's there)
            Log.warn("[Decorators.command] Redundant description value");
        }
        else {
            type = DecoratorCommandType.Weak;
        }

        // Force set the executed method
        finalCommand = Object.assign({}, descriptor.value);
        (finalCommand as any).executed = target;
        (finalCommand as any).type = type;

        // Push for the command store to pickup and register
        DecoratorCommands.push(finalCommand as IWeakCommand | ISimpleCommand);
    };
}

export function deprecated(use?: string): any {
    return function (target) {
        const functionName: string = Object.keys(target)[0];
        const className: string = target.constructor.name;

        let notice: string = `[Deprecated] Function '${className}.${functionName}' is deprecated and may be removed in the future.`;

        if (use !== undefined) {
            notice += ` Use ${use} instead.`;
        }

        Log.warn(notice);
    };
}

// TODO: Values must be validated

// Commands -> General

export function Name(name: string): any {
    return function (target: any, key: string) {
        return DecoratorUtils.overrideMeta(target, "name", name);
    };
}

export function Description(description: string): any {
    return function (target: any, key: string) {
        return DecoratorUtils.overrideMeta(target, "description", description);
    };
}

export function Aliases(aliases: string[]): any {
    return function (target: any, key: string) {
        return class extends target {
            public readonly aliases: string[] = aliases;
        };
    };
}

export function Arguments(args: IArgument[]): any {
    return function (target: any, key: string) {
        return class extends target {
            public readonly args: IArgument[] = args;
        };
    };
}

// Commands -> Constraints

type Constructor = new (...args: any[]) => {};

export abstract class DecoratorUtils {
    // TODO: Attempt to merge override methods
    public static overrideConstraint(target: any, constraint: string, value: any): any {
        return class extends target {
            public readonly constraints: IConstraints = {
                ...this.constraints,
                [constraint]: value
            };
        };
    }

    public static overrideMeta(target: any, meta: string, value: any): any {
        return class extends target {
            public readonly ["r"]: IFragmentMeta = {
                ...this.meta,
                [meta]: value
            };
        };
    }
}

export abstract class Constraint {
    public static Env(env: ChatEnv): any {
        return function (target: any, key: string) {
            return DecoratorUtils.overrideConstraint(target, "environment", env);
        };
    }

    public static Cooldown(time: number): any {
        return function (target: any, key: string) {
            return DecoratorUtils.overrideConstraint(target, "cooldown", time);
        };
    }

    public static Disabled(target: any): any {
        return class extends target {
            public readonly isEnabled: boolean = false;
        };
    }

    public static Specific(constraints: SpecificConstraints): any {
        return function (target: any, key: string) {
            return DecoratorUtils.overrideConstraint(target, "specific", constraints);
        };
    }

    public static IssuerPermissions(permissions: any[]): any {
        return function (target: any, key: string) {
            return DecoratorUtils.overrideConstraint(target, "issuerPermissions", permissions);
        };
    }

    public static SelfPermissions(permissions: any[]): any {
        return function (target: any, key: string) {
            return DecoratorUtils.overrideConstraint(target, "selfPermissions", permissions);
        };
    }
}
