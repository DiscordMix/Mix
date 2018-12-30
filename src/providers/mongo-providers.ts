import {IQueriableProvider} from "./provider";
import {Snowflake} from "discord.js";
import {Collection as MongoCollection, DeleteWriteOpResultObject} from "mongodb";
import {AutoTransaction} from "../transactions/transaction";
import {Collection} from "../collections/collection";
import Bot from "../core/bot";

export type GuildConfig = {
    readonly guildId: Snowflake;
}

/**
 * Provides interface to easily interact with per-guild configuration
 */
export class GuildCfgMongoProvider extends AutoTransaction<GuildConfig, Collection<Snowflake, GuildConfig>, number> implements IQueriableProvider<GuildConfig> {
    protected static readonly key: string = "guildId";

    public readonly cache: Collection<Snowflake, GuildConfig>;

    protected readonly x: MongoCollection;

    public constructor(bot: Bot, collection: MongoCollection) {
        super(bot, 10 * 1000);

        this.cache = new Collection<Snowflake, GuildConfig>();
        this.x = collection;
    }

    public async commit(): Promise<number> {
        return (await this.x.insertMany(this.cache.array())).insertedCount;
    }

    public async has(key: string): Promise<boolean> {
        if (this.cache.has(key)) {
            return true;
        }

        return await this.x.count({
            [GuildCfgMongoProvider.key]: key
        }) > 0;
    }

    public find(query: Partial<GuildConfig>): Promise<GuildConfig[] | null> {
        return this.x.find(query).toArray();
    }
    
    public findOne(query: Partial<GuildConfig>): Promise<GuildConfig | null> {
        return this.x.findOne(query);
    }

    public async update(query: Partial<GuildConfig>, value: GuildConfig): Promise<number> {
        // TODO: Inspect result
        return (await this.x.update(query, value)).result;
    }
    
    public async updateOne(query: Partial<GuildConfig>, value: GuildConfig): Promise<boolean> {
        return (await this.x.updateOne(query, value)).upsertedCount > 0;
    }

    public async delete(query: Partial<GuildConfig>): Promise<number> {
        return (await this.x.deleteMany(query)).deletedCount || 0;
    }

    public async deleteOne(query: Partial<GuildConfig>): Promise<boolean> {
        const result: DeleteWriteOpResultObject = await this.x.deleteOne(query);

        return result.deletedCount ? result.deletedCount > 0 : false;
    }

    public async get(key: string): Promise<GuildConfig | null> {
        if (this.cache.has(key)) {
            return this.cache.get(key) || null;
        }

        // TODO: Add to cache
        return (await this.x.findOne({
            [GuildCfgMongoProvider.key]: key
        })).toArray();
    }

    public set(key: string, value: GuildConfig): boolean {
        this.cache.set(key, value);

        return true;
    }
}