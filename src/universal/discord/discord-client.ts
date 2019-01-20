import {Guild, Client, Collection} from "discord.js";
import {DiscordSnowflake} from "../../core/bot-extra";
import DiscordEvent from "../../core/discord-event";
import {IUniversalClient, EventEmitterListener, IEventEmitter} from "../universal-client";

export interface IDiscordClient extends IEventEmitter<DiscordEvent>, IUniversalClient {
    readonly guilds: Collection<DiscordSnowflake, Guild>;

    on(event: DiscordEvent, listener: EventEmitterListener): this;
    once(event: DiscordEvent, listener: EventEmitterListener): this;
    emit(event: DiscordEvent, ...args: any[]): boolean;
}

export default class DiscordClient extends Client implements IDiscordClient {
    //
}
