import DataAdapter from "./data-adapter";

const _ = require("lodash");

/**
 * @extends DataAdapter
 */
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
	 * @param {String} path
	 * @param {(Snowflake|Null)} guildId
	 * @returns {Object}
	 */
	get(path, guildId = null) {
		return _.get(this.data, DataAdapter.resolvePath(path, guildId));
	}

	/**
	 * Set guild data
	 * @param {String} path
	 * @param {*} value
	 * @param {(Snowflake|Null)} guildId
	 */
	set(path, value, guildId = null) {
		_.set(this.data, DataAdapter.resolvePath(path, guildId), value);
	}

	/**
	 * Merge guild data
	 * @param {String} path
	 * @param {*} value
	 * @param {(Snowflake|Null)} guildId
	 */
	merge(path, value, guildId = null) {
		throw new Error("[ObjectAdapter.merge] Method not implemented.");
	}
}
