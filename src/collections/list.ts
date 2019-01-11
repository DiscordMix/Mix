import {EventEmitter} from "events";
import _ from "lodash";

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
        for (const search of this.items) {
            if (search === item) {
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
        for (const item of this.items) {
            if (_.get(item, path) === value) {
                return item;
            }
        }

        return null;
    }
}
