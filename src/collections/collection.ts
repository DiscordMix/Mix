import EventEmitter from "events";

const _ = require("lodash");

/**
 * @extends EventEmitter
 */
export default class Collection extends EventEmitter {
    private items: Array<any>;

    /**
     * @param {Array} items
     */
    constructor(items: Array<any> = []) {
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
    at(index: number): any {
        return this.items[index];
    }

    /**
     * Remove an item from this collection by its index
     * @param {number} index
     * @return {boolean} Whether the item was removed
     */
    removeAt(index: number): boolean {
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
    add(item: any): void {
        this.items.push(item);
        this.emit("itemAdded", item);
    }

    /**
     * Add an item to this collection only if it doesn't already exist
     * @param {*} item
     * @return {boolean} Whether the item was added
     */
    addUnique(item: any): boolean {
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
    contains(item: any): boolean {
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] === item) {
                return true;
            }
        }

        return false;
    }

    /**
     * @todo Move this method into the Utils class?
     * Find an item in this collection
     * @param {string} path
     * @param {*} value
     */
    find(path: string, value: any): any {
        for (let i = 0; i < this.items.length; i++) {
            if (_.get(this.items[i], path) === value) {
                return this.items[i];
            }
        }

        return null;
    }
}
