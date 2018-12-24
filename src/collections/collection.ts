import EventEmitter from "events";
import {default as _} from "lodash";

/**
 * @extends EventEmitter
 */
export default class List<DataType> extends EventEmitter {
    protected readonly items: DataType[];

    /**
     * @param {Array} items
     */
    public constructor(items: DataType[] = []) {
        super();

        /**
         * @type {Array<*>}
         * @protected
         */
        this.items = items;
    }

    /**
     * Get an item in this collection by its index
     * @param {number} index
     * @return {*}
     */
    public at(index: number): DataType | null {
        return this.items[index] || null;
    }

    /**
     * Remove an item from this collection by its index
     * @param {number} index
     * @return {boolean} Whether the item was removed
     */
    public removeAt(index: number): boolean {
        if (this.items[index] !== null && this.items[index] !== undefined) {
            this.emit("itemRemoved", this.items[index]);
            this.items.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * Add an item to this collection
     * @param {DataType} item
     */
    public add(item: DataType): this {
        this.items.push(item);
        this.emit("itemAdded", item);

        return this;
    }

    /**
     * Add an item to this collection only if it doesn't already exist
     * @param {DataType} item
     * @return {boolean} Whether the item was added
     */
    public addUnique(item: DataType): boolean {
        if (!this.contains(item)) {
            this.add(item);

            return true;
        }

        return false;
    }

    /**
     * Determine whether this collection contains an item
     * @param {DataType} item
     * @return {boolean}
     */
    public contains(item: DataType): boolean {
        for (let i: number = 0; i < this.items.length; i++) {
            if (this.items[i] === item) {
                return true;
            }
        }

        return false;
    }

    /**
     * Find an item in this collection
     * @param {string} path
     * @param {*} value
     * @return {DataType | null}
     */
    public find(path: string, value: any): DataType | null {
        for (let i: number = 0; i < this.items.length; i++) {
            if (_.get(this.items[i], path) === value) {
                return this.items[i];
            }
        }

        return null;
    }
}

export class Collection<KeyType, ValueType> extends Map<KeyType, ValueType> {
    protected cachedValueArray: ValueType[] | null;
    protected cachedKeyArray: KeyType[] | null;

    public constructor(iterable?: any) {
        super(iterable);

        this.cachedValueArray = null;
        this.cachedKeyArray = null;
    }

    protected resetCache(): this {
        this.cachedKeyArray = null;
        this.cachedValueArray = null;

        return this;
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
}