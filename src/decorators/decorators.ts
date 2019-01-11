import {Snowflake} from "discord.js";
import {CommandExeHandler, IArgument, IConstraints} from "../commands/command";
import Log from "../core/log";
import {IFragment} from "../fragments/fragment";

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

        let message: string = `[Deprecated] Function '${className}.${functionName}' is deprecated and may be removed in the future.`;

        if (use !== undefined) {
            message += ` Use ${use} instead.`;
        }

        Log.warn(message);
    };
}
