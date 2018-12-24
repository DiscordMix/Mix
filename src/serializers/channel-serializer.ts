import {TextChannel, Snowflake} from "discord.js";
import {Collection} from "../collections/collection";
import {ISerializer} from "./serializer";

/**
 * Serializes Discord.JS channels from strings to channel objects and vise versa
 */
export default class ChannelSerializer<ChannelType = TextChannel> implements ISerializer<ChannelType> {
    protected readonly source: Collection<Snowflake, ChannelType>;

    public constructor(source: Collection<Snowflake, ChannelType>) {
        this.source = source;
    }

    public serialize(data: ChannelType): string {
        return data.toString();
    }
    
    // TODO: Implement
    public deserialize(serializedData: string): ChannelType | null {
        throw new Error("Method not implemented.");
    }
}