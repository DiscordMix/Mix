export default class DataAdapter {
	/**
	 * Retrieve guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @returns {*}
	 */
	get(guildId, path) {
		throw new Error("[DataAdapter.get] Method not implemented.");
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} value
	 */
	set(guildId, path, value) {
		throw new Error("[DataAdapter.set] Method not implemented.");
	}
}
