import {TextChannel, Snowflake, Channel} from "discord.js";
import {Collection} from "../collections/collection";
import {ISerializer} from "./serializer";

/**
 * Serializes Discord.JS channels from strings to channel objects and vise versa
 */
export default class ChannelSerializer<T extends Channel = TextChannel> implements ISerializer<T> {
    protected readonly source: Collection<Snowflake, T>;

    public constructor(source: Collection<Snowflake, T>) {
        this.source = source;
    }

    public serialize(data: T): string {
        return data.toString();
    }
    
    // TODO: Implement
    public deserialize(serializedData: string): T | null {
        throw new Error("Method not implemented.");
    }
}