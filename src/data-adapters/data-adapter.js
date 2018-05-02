export default class DataAdapter {
	/**
	 * Retrieve guild data
	 * @param {String} path
	 * @param {(Snowflake|Null)} guildId
	 * @abstract
	 * @returns {*}
	 */
	get(path, guildId = null) {
		throw new Error("[DataAdapter.get] Method not implemented.");
	}

	/**
	 * Set guild data
	 * @param {String} path
	 * @param {*} value
	 * @param {(Snowflake|Null)} guildId
	 * @abstract
	 * @returns {*}
	 */
	set(path, value, guildId = null) {
		throw new Error("[DataAdapter.set] Method not implemented.");
	}

	/**
	 * @param {String} path
	 * @param {(Snowflake|Null)} guildId
	 * @abstract
	 * @return {String}
	 */
	static resolvePath(path, guildId) {
		return `${guildId ? `${guildId}.` : ""}${path}`;
	}
}
