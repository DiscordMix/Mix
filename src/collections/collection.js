const EventEmitter = require("events");
const _ = require("lodash");

/**
 * @extends EventEmitter
 */
export default class Collection extends EventEmitter {
	/**
	 * @param {Array} items
	 */
	constructor(items = []) {
		super();

		/**
		 * @type {Array}
		 * @private
		 */
		this.items = items;
	}

	/**
	 * Get an item in this collection by its index
	 * @param {number} index
	 * @returns {*}
	 */
	at(index) {
		return this.items[index];
	}

	/**
	 * Remove an item from this collection by its index
	 * @param {number} index
	 * @returns {boolean} Whether the item was removed
	 */
	removeAt(index) {
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
	add(item) {
		this.items.push();
		this.emit("itemAdded", item);
	}

	/**
	 * Add an item to this collection only if it doesn't already exist
	 * @param {*} item
	 * @returns {boolean} Whether the item was added
	 */
	addUnique(item) {
		if (!this.contains(item)) {
			this.add(item);

			return true;
		}

		return false;
	}

	/**
	 * Determine whether this collection contains an item
	 * @param {*} item
	 * @returns {boolean}
	 */
	contains(item) {
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
	find(path, value) {
		for (let i = 0; i < this.items.length; i++) {
			if (_.get(this.items[i], path) === value) {
				return this.items[i];
			}
		}

		return null;
	}
}
