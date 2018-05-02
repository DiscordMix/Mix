import DataAdapter from "./data-adapter";

/**
 * @extends DataAdapter
 */
export default class SqliteAdapter extends DataAdapter {
	constructor() {
		super();
	}

	/**
	 * Retrieve guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @returns {*}
	 */
	get(guildId, path) {
		throw new Error("[SqliteAdapter.get] Method not implemented.");
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} data
	 */
	set(guildId, path, data) {
		throw new Error("[SqliteAdapter.set] Method not implemented.");
	}

	/**
	 * Merge guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} data
	 */
	merge(guildId, path, data) {
		throw new Error("[SqliteAdapter.merge] Method not implemented.");
	}
}
