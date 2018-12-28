import {Snowflake} from "discord.js";

export interface IDbMessage {
    readonly id: Snowflake;
    readonly authorId: Snowflake;
    readonly authorName: string;
    readonly authorTag: string;
    readonly time: number;
    readonly content: string;
    readonly channelId: Snowflake;
    readonly guildId: Snowflake;
}