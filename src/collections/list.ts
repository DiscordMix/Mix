import {EventEmitter} from "events";
import _ from "lodash";

namespace Collections {
    export class List<DataType> extends EventEmitter {
        protected readonly items: DataType[];

        public constructor(items: DataType[] = []) {
            super();

            this.items = items;
        }

        /**
         * Get an item in this collection by its index.
         */
        public at(index: number): DataType | null {
            return this.items[index] || null;
        }

        /**
         * Remove an item from this collection by its index.
         * @return {boolean} Whether the item was removed.
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
         * Add an item to this collection.
         */
        public add(item: DataType): this {
            this.items.push(item);
            this.emit("itemAdded", item);

            return this;
        }

        /**
         * Add an item to this collection only if it doesn't already exist.
         * @return {boolean} Whether the item was added.
         */
        public addUnique(item: DataType): boolean {
            if (!this.contains(item)) {
                this.add(item);

                return true;
            }

            return false;
        }

        /**
         * Determine whether this collection contains an item.
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
         * Find an item in this collection.
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
}
