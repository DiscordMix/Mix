import {EventEmitter} from "events";
import {DiscordEvent} from "..";
import {Dictionary} from "@atlas/xlib";
import {Snowflake} from "./bot-extra";
import {Guild} from "discord.js";

export type EventEmitterListener = (...args: any[]) => void;

export interface IClient extends EventEmitter {
    on(event: DiscordEvent, listener: EventEmitterListener): this;
    once(event: DiscordEvent, listener: EventEmitterListener): this;
    emit(event: DiscordEvent, ...args: any[]): boolean;

    readonly guilds: Dictionary<Snowflake, Guild>;
}