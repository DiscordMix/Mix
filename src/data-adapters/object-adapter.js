import DataAdapter from "./data-adapter";

export default class ObjectAdapter extends DataAdapter {
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
	 * @param {Snowflake} guildId
	 * @returns {Object}
	 */
	get(guildId) {
		return this.data[guildId];
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {Object} data
	 */
	set(guildId, data) {
		this.data[guildId] = data;
	}

	/**
	 * Merge data
	 * @param guildId
	 * @param data
	 */
	merge(guildId, data) {
		throw new Error("[ObjectAdapter.merge] Method not implemented.");
	}
}
