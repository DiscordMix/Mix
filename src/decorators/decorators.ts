import {CommandExecuted, CommandRestrict} from "../commands/command";
import {Argument} from "..";
import {FragmentMeta} from "../fragments/fragment";
import Log from "../core/log";
import {Snowflake} from "discord.js";

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

export const BotEvents: Map<string, any> = new Map();
export const ChannelMessageEvents: Map<Snowflake, any> = new Map();

export const DecoratorCommands: Array<DecoratorCommand> = [];

export function on(eventName: DiscordEvent | string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("meta is ", target.meta);

        BotEvents.set(eventName, descriptor.value.apply(target));
    }
}

export function message(channel: Snowflake) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        ChannelMessageEvents.set(channel, descriptor.value.apply(target));
    }
}

export enum DecoratorCommandType {
    Simple,
    Weak
}

export interface DecoratorCommand {
    readonly meta: FragmentMeta;
    readonly type: DecoratorCommandType;
}

export interface WeakCommand extends PartialWeakCommand {
    readonly executed: CommandExecuted;
}

export interface PartialWeakCommand extends DecoratorCommand {
    readonly aliases?: Array<string>;
    readonly restrict?: CommandRestrict;
    readonly arguments?: Array<Argument>;
}

export interface SimpleCommand extends DecoratorCommand {
    readonly executed: CommandExecuted;
}

// options: command name | WeakCommand
export function command(options: string | PartialWeakCommand, description?: string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value === undefined) {
            Log.error("[Decorators.command] Expecting value for command decorator");

            return;
        }

        let finalCommand: WeakCommand | SimpleCommand | null = null;
        let type: DecoratorCommandType = DecoratorCommandType.Simple;

        if (typeof options === "string") {
            if (description === undefined) {
                // TODO: Log command name (if it's there)
                Log.error("[Decorators.command] Expecting command description");

                return;
            }

            (finalCommand as any).meta = {
                name: options,
                description: description
            };
        }
        else if (typeof options !== "object") {
            // TODO: Log command name (if it's there)
            Log.error("[Decorators.command] Invalid type of input, expecting either string or object");

            return;
        }
        else if (typeof options === "object" && description !== undefined) {
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
        DecoratorCommands.push(finalCommand as WeakCommand | SimpleCommand);
    }
}