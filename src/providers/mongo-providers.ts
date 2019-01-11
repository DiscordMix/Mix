import {Snowflake} from "discord.js";
import {Collection as MongoCollection, DeleteWriteOpResultObject} from "mongodb";
import {Collection} from "../collections/collection";
import Bot from "../core/bot";
import {AutoTransaction} from "../transactions/transaction";
import {IQueriableProvider} from "./provider";

export interface IGuildConfig {
    readonly guildId: Snowflake;
}

/**
 * Provides interface to easily interact with per-guild configuration
 */
export class GuildCfgMongoProvider extends AutoTransaction<IGuildConfig, Collection<Snowflake, IGuildConfig>, number> implements IQueriableProvider<IGuildConfig> {
    protected static readonly key: string = "guildId";

    public readonly cache: Collection<Snowflake, IGuildConfig>;

    protected readonly x: MongoCollection;

    public constructor(bot: Bot, collection: MongoCollection) {
        super(bot, 10 * 1000);

        this.cache = new Collection<Snowflake, IGuildConfig>();
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

    public find(query: Partial<IGuildConfig>): Promise<IGuildConfig[] | null> {
        return this.x.find(query).toArray();
    }

    public findOne(query: Partial<IGuildConfig>): Promise<IGuildConfig | null> {
        return this.x.findOne(query);
    }

    public async update(query: Partial<IGuildConfig>, value: IGuildConfig): Promise<number> {
        // TODO: Inspect result
        return (await this.x.update(query, value)).result;
    }

    public async updateOne(query: Partial<IGuildConfig>, value: IGuildConfig): Promise<boolean> {
        return (await this.x.updateOne(query, value)).upsertedCount > 0;
    }

    public async delete(query: Partial<IGuildConfig>): Promise<number> {
        return (await this.x.deleteMany(query)).deletedCount || 0;
    }

    public async deleteOne(query: Partial<IGuildConfig>): Promise<boolean> {
        const result: DeleteWriteOpResultObject = await this.x.deleteOne(query);

        return result.deletedCount ? result.deletedCount > 0 : false;
    }

    public async get(key: string): Promise<IGuildConfig | null> {
        if (this.cache.has(key)) {
            return this.cache.get(key) || null;
        }

        // TODO: Add to cache
        return (await this.x.findOne({
            [GuildCfgMongoProvider.key]: key
        })).toArray();
    }

    public set(key: string, value: IGuildConfig): boolean {
        this.cache.set(key, value);

        return true;
    }
}
