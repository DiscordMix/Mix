import EventEmitter from "events";
import {default as _} from "lodash";

/**
 * @extends EventEmitter
 */
export default class Collection extends EventEmitter {
    private readonly items: any[];

    /**
     * @param {Array} items
     */
    public constructor(items: any[] = []) {
        super();

        /**
         * @type {Array<*>}
         * @private
         */
        this.items = items;
    }

    /**
     * Get an item in this collection by its index
     * @param {number} index
     * @return {*}
     */
    public at(index: number): any {
        return this.items[index];
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
     * @param {*} item
     */
    public add(item: any): void {
        this.items.push(item);
        this.emit("itemAdded", item);
    }

    /**
     * Add an item to this collection only if it doesn't already exist
     * @param {*} item
     * @return {boolean} Whether the item was added
     */
    public addUnique(item: any): boolean {
        if (!this.contains(item)) {
            this.add(item);

            return true;
        }

        return false;
    }

    /**
     * Determine whether this collection contains an item
     * @param {*} item
     * @return {boolean}
     */
    public contains(item: any): boolean {
        for (let i = 0; i < this.items.length; i++) {
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
     */
    public find(path: string, value: any): any {
        for (let i = 0; i < this.items.length; i++) {
            if (_.get(this.items[i], path) === value) {
                return this.items[i];
            }
        }

        return null;
    }
}
