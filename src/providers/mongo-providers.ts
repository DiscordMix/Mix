import {IQueriableProvider} from "./provider";
import {Snowflake} from "discord.js";
import {Collection as MongoCollection, InsertWriteOpResult} from "mongodb";
import {AutoTransaction} from "../transactions/transaction";
import {Bot} from "..";
import {Collection} from "../collections/collection";

export type GuildConfig = {
    readonly guildId: Snowflake;
}

export class GuildConfigMongoProvider extends AutoTransaction<GuildConfig, Collection<Snowflake, GuildConfig>, number> implements IQueriableProvider<GuildConfig> {
    private readonly x: MongoCollection;

    protected readonly cache: Collection<Snowflake, GuildConfig>;

    public constructor(bot: Bot, collection: MongoCollection) {
        super(bot, 10 * 1000);

        this.cache = new Collection<Snowflake, GuildConfig>();
        this.x = collection;
    }

    public async commit(): Promise<number> {
        return (await this.x.insertMany(this.cache.array())).insertedCount;
    }

    public has(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
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