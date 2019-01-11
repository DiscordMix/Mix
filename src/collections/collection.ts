import _ from "lodash";

export class Collection<KeyType, ValueType> extends Map<KeyType, ValueType> {
    protected cachedValueArray: ValueType[] | null;
    protected cachedKeyArray: KeyType[] | null;

    public constructor(iterable?: any) {
        super(iterable);

        this.cachedValueArray = null;
        this.cachedKeyArray = null;
    }

    public set(key: KeyType, value: ValueType): this {
        this.resetCache();
        super.set(key, value);

        return this;
    }

    public delete(key: KeyType): boolean {
        this.resetCache();

        return super.delete(key);
    }

    public array(): ValueType[] {
        if (this.cachedValueArray !== null) {
            return this.cachedValueArray;
        }

        const result: ValueType[] = [...this.values()];

        if (this.cachedValueArray === null) {
            this.cachedValueArray = result;
        }

        return result;
    }

    public keysArray(): KeyType[] {
        if (this.cachedKeyArray !== null) {
            return this.cachedKeyArray;
        }

        const result: KeyType[] = [...this.keys()];

        if (this.cachedKeyArray === null) {
            this.cachedKeyArray = result;
        }

        return result;
    }

    public first(): ValueType | null {
        return this.values().next().value || null;
    }

    public firstKey(): KeyType | null {
        return this.keys().next().value || null;
    }

    protected resetCache(): this {
        this.cachedKeyArray = null;
        this.cachedValueArray = null;

        return this;
    }
}
