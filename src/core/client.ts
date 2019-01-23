import {Dictionary} from "@atlas/xlib";
import {Guild} from "discord.js";
import {EventEmitter} from "events";
import {Snowflake} from "./bot-extra";
import DiscordEvent from "./discord-event";

export type EventEmitterListener = (...args: any[]) => void;

export interface IClient extends EventEmitter {
    readonly guilds: Dictionary<Snowflake, Guild>;

    on(event: DiscordEvent, listener: EventEmitterListener): this;
    once(event: DiscordEvent, listener: EventEmitterListener): this;
    emit(event: DiscordEvent, ...args: any[]): boolean;
}