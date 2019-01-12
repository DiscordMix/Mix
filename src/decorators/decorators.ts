import "reflect-metadata";

import {Snowflake} from "discord.js";
import Command, {CommandExeHandler, IArgument, IConstraints, SpecificConstraints, CommandRunner} from "../commands/command";
import Log from "../core/log";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import ChatEnv from "../core/chat-env";
import Utils from "../core/utils";

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

export function Deprecated(use?: string): any {
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

// Component

export interface ICommandComponentOpts {
    readonly description: string;
    readonly cooldown: number;
    readonly env: ChatEnv;
    readonly specific: SpecificConstraints;
}

export abstract class Component {
    public static Command(name: string, options?: Partial<ICommandComponentOpts>): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            target = DecoratorUtils.overrideMeta(target, "name", name);

            if (options === undefined || typeof options !== "object") {
                return target;
            }

            // General
            if (typeof options.description === "string") {
                target = DecoratorUtils.overrideMeta(target, "description", options.description);
            }

            // Constraints
            if (typeof options.cooldown === "number") {
                target = DecoratorUtils.overrideConstraint(target, "cooldown", options.cooldown);
            }

            if (typeof options.env === "number") {
                target = DecoratorUtils.overrideConstraint(target, "env", options.env);
            }

            if (typeof options.specific === "object") {
                target = DecoratorUtils.overrideConstraint(target, "specific", options.specific);
            }

            return target;
        };
    }

    public static Fragment<T = any>(name: string, options?: T): any {
        // TODO: Implement
        throw Log.notImplemented;
    }
}

// Commands -> General

export function Name(name: string): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return DecoratorUtils.overrideMeta(target, "name", name);
    };
}

export function Description(description: string): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return DecoratorUtils.overrideMeta(target, "description", description);
    };
}

export function Aliases(...aliases: string[]): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly aliases: string[] = [...target.aliases, ...aliases];
        };
    };
}

export function Arguments(args: IArgument[]): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly args: IArgument[] = [...target.args, ...args];
        };
    };
}

// Commands -> Other

/**
 * Methods that will be executed after successful command execution
 * @param {CommandRunner[]} runners
 * @return {*}
 */
export function Connect(...runners: CommandRunner<void>[]): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly connections: CommandRunner<void>[] = [...target.connections, ...runners];
        };
    };
}

/**
 * Specify the required registered services required by this command
 * @param {string[]} services
 * @return {*}
 */
export function DependsOn(...services: string[]): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly dependsOn: string[] = [...target.dependsOn, ...services]
        };
    };
}

/**
 * Methods that serve as pre-requisites for execution
 * @param {string[]} guards
 * @return {*}
 */
export function Guards(...guards: string[]): any {
    return function (target: any, key: string) {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly guards: CommandRunner[] = [
                ...target.guards,
                ...DecoratorUtils.extractMethods(target, [...guards])
            ];
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

    public static bind(target: any): void {
        if (typeof target !== "function") {
            throw Log.error("Expecting target to be a class");
        }
    }

    public static extractMethods<T = any>(source: any, keys: string[]): T[] {
        const result: T[] = [];

        for (const key of keys) {
            if (typeof source[key] !== "function") {
                throw Log.error("Expecting source's property to be a method");
            }

            result.push(source[key]);
        }

        return result;
    }
}

export abstract class Constraint {
    public static Env(env: ChatEnv): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "environment", env);
        };
    }

    public static Cooldown(time: number): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "cooldown", time);
        };
    }

    public static Disabled(target: any): any {
        DecoratorUtils.bind(target);

        return class extends target {
            public readonly isEnabled: boolean = false;
        };
    }

    public static Specific(constraints: SpecificConstraints): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "specific", constraints);
        };
    }

    public static IssuerPermissions(permissions: any[]): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "issuerPermissions", permissions);
        };
    }

    public static SelfPermissions(permissions: any[]): any {
        return function (target: any, key: string) {
            DecoratorUtils.bind(target);

            return DecoratorUtils.overrideConstraint(target, "selfPermissions", permissions);
        };
    }
}
