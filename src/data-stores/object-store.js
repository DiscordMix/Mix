import DataStore from "./data-store";

const _ = require("lodash");

/**
 * @extends DataStore
 */
export default class ObjectStore extends DataStore {
	/**
	 * @param {Object} data
	 */
	constructor(data) {
		super();

		/**
		 * @type {(Object|Null)}
		 * @private
		 */
		this.data = data;
	}

	/**
	 * Retrieve guild data
	 * @param {String} path
	 * @returns {Object}
	 */
	get(path) {
		return _.get(this.data, path);
	}

	/**
	 * Set guild data
	 * @param {String} path
	 * @param {*} value
	 */
	set(path, value) {
		_.set(this.data, path, value);
	}

	/**
	 * Merge guild data
	 * @param {String} path
	 * @param {*} value
	 */
	merge(path, value) {
		throw new Error("[ObjectStore.merge] Method not implemented.");
	}
}
