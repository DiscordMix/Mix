import {Channel, Snowflake, TextChannel} from "discord.js";
import {Collection} from "../collections/Collection";
import {ISerializer} from "./Serializer";
import Log from "../core/Log";

namespace Serializers {
    /**
     * Serializes Discord.JS channels from strings to channel objects and vise versa.
     */
    export class ChannelSerializer<T extends Channel = TextChannel> implements ISerializer<T> {
        protected readonly source: Collection<Snowflake, T>;

        public constructor(source: Collection<Snowflake, T>) {
            this.source = source;
        }

        public serialize(data: T): string {
            return data.toString();
        }

        // TODO: Implement.
        public deserialize(serializedData: string): T | null {
            throw Log.notImplemented;
        }
    }
}
