import {Dictionary} from "@atlas/xlib";
import {Guild} from "discord.js";
import {Snowflake} from "../../core/bot-extra";
import DiscordEvent from "../../core/discord-event";
import {IUniversalClient, EventEmitterListener, IEventEmitter} from "../universal-client";

export interface IDiscordClient extends IEventEmitter<DiscordEvent>, IUniversalClient {
    readonly guilds: Dictionary<Snowflake, Guild>;

    on(event: DiscordEvent, listener: EventEmitterListener): this;
    once(event: DiscordEvent, listener: EventEmitterListener): this;
    emit(event: DiscordEvent, ...args: any[]): boolean;
}
