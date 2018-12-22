type CollectionMapCallback<TKey, TValue> = (value: TValue, key: TKey) => TValue;

export default class Collection<TKey, TValue> extends Map<TKey, TValue> {
    protected valueCache: TValue[] | null;
    protected keyCache: TKey[] | null;
    
    // TODO: Type of entries
    public constructor(entries?: any) {
        super(entries);

        this.valueCache = [];
        this.keyCache = [];
    }
    
    public set(key: TKey, value: TValue): this {
        if (this.keyCache && !this.keyCache.includes(key)) {
            this.keyCache.push(key);
        }
        else if (!this.keyCache) {
            this.keyCache = [key];
        }

        this.valueCache = [];
        super.set(key, value);

        return this;
    }

    public first(): TValue {
        return this.values().next().value;
    }

    public array(): TValue[] {
        return this.valueCache ? this.valueCache : this.valueCache = [...this.values()];
    }

    public clone(): Collection<TKey, TValue> {
        return new Collection(...this.entries());
    }

    public concat(...collections: Collection<TKey, TValue>[]): Collection<TKey, TValue> {
        const result: Collection<TKey, TValue> = this.clone();

        for (const collection of collections) {
            for (const [key, value] of collection) {
                result.set(key, value);
            }
        }

        return result;
    }

    public map(callback: CollectionMapCallback<TKey, TValue>): this {
        for (const [key, value] of this) {
            callback(value, key);
        }

        return this;
    }

    public reduce(callback: CollectionMapCallback<TKey, TValue>): this {
        for (const [key, value] of this) {
            if (!callback(value, key)) {
                this.delete(key);
            }
        }

        return this;
    }

    public filter(callback: CollectionMapCallback<TKey, TValue>): Collection<TKey, TValue> {
        const result: Collection<TKey, TValue> = this.clone();

        for (const [key, value] of this) {
            if (callback(value, key)) {
                result.set(key, value);
            }
        }

        return result;
    }
}
