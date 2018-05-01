import DataAdapter from "./data-adapter";

export default class SqliteAdapter extends DataAdapter {
	constructor() {
		super();
	}

	/**
	 * Retrieve guild data
	 * @param {Snowflake} guildId
	 * @returns {Object}
	 */
	get(guildId) {
		throw new Error("[DataAdapter.get] Method not implemented.");
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {Object} data
	 */
	set(guildId, data) {
		throw new Error("[DataAdapter.set] Method not implemented.");
	}

	/**
	 * Merge data
	 * @param guildId
	 * @param data
	 */
	merge(guildId, data) {
		throw new Error("[DataAdapter.set] Method not implemented.");
	}
}
