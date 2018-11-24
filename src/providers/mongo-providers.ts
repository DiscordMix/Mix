import {QueriableProvider} from "./provider";
import {Snowflake} from "discord.js";
import {Collection} from "mongodb";

export type GuildConfig = {
    readonly guildId: Snowflake;
}

export class GuildConfigMongoProvider implements QueriableProvider<GuildConfig> {
    private readonly x: Collection;

    public constructor(collection: Collection) {
        this.x = collection;
    }

    public find(query: Partial<GuildConfig>): Promise<GuildConfig[] | null> {
        return this.x.find(query).toArray();
    }
    
    public findOne(query: Partial<GuildConfig>): Promise<GuildConfig | null> {
        return this.x.findOne(query);
    }

    public update(query: Partial<GuildConfig>, value: GuildConfig): Promise<number> {
        throw new Error("Method not implemented.");
    }
    
    public updateOne(query: Partial<GuildConfig>, value: GuildConfig): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public delete(query: Partial<GuildConfig>): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public deleteOne(query: Partial<GuildConfig>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public get(key: string): GuildConfig | null {
        throw new Error("Method not implemented.");
    }

    public set(key: string, value: GuildConfig): boolean {
        throw new Error("Method not implemented.");
    }
}