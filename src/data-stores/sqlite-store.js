import DataStore from "./data-store";

/**
 * @extends DataStore
 */
export default class SqliteStore extends DataStore {
	constructor() {
		super();
	}

	/**
	 * Retrieve guild data
	 * @param {String} path
	 * @returns {*}
	 */
	get(path) {
		throw new Error("[SqliteStore.get] Method not implemented.");
	}

	/**
	 * Set guild data
	 * @param {String} path
	 * @param {*} value
	 */
	set(path, value) {
		throw new Error("[SqliteStore.set] Method not implemented.");
	}

	/**
	 * Merge guild data
	 * @param {String} path
	 * @param {*} value
	 */
	merge(path, value) {
		throw new Error("[SqliteStore.merge] Method not implemented.");
	}
}
