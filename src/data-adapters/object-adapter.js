import DataAdapter from "./data-adapter";

const _ = require("lodash");

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
	 * @param {String} path
	 * @returns {Object}
	 */
	get(guildId, path) {
		return _.get(this.data, `${guildId}.${path}`);
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} value
	 */
	set(guildId, path, value) {
		_.set(this.data, `${guildId}.${path}`, value);
	}

	/**
	 * Merge data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} value
	 */
	merge(guildId, path, value) {
		throw new Error("[ObjectAdapter.merge] Method not implemented.");
	}
}
