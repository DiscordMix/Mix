import DataAdapter from "./data-adapter";

const fs = require("fs");

export default class JsonAdapter extends DataAdapter {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		super();

		/**
		 * @type {String}
		 * @private
		 */
		this.path = path;

		/**
		 * @type {(Object|Null)}
		 * @private
		 */
		this.data = null;
	}

	/**
	 * Reload the data from the source file
	 * @returns {Promise}
	 */
	async reload() {
		this.validate();

		return new Promise((resolve) => {
			fs.readFile(this.path, (error, data) => {
				if (error) {
					throw error;
				}

				this.data = JSON.parse(data.toString());
				resolve();
			});
		});
	}

	/**
	 * Save the data into the source file
	 * @return {Promise}
	 */
	async save() {
		this.validate();

		return new Promise((resolve) => {
			fs.writeFile(this.path, JSON.stringify(this.data), (error) => {
				if (error) {
					throw error;
				}

				resolve();
			});
		});
	}

	/**
	 * Ensure that the source file exists
	 */
	validate() {
		if (!fs.existsSync(this.path)) {
			throw new Error(`[JsonAdapter] Path does not exist: ${this.path}`);
		}
	}

	/**
	 * Retrieve guild data
	 * @param {Snowflake} guildId
	 * @returns {Object}
	 */
	get(guildId) {
		if (!this.loaded) {
			throw new Error("[JsonAdapter.get] No data is currently loaded.");
		}

		return this.data[guildId];
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {Object} data
	 */
	set(guildId, data) {
		if (!this.loaded) {
			throw new Error("[JsonAdapter.set] No data is currently loaded.");
		}

		this.data[guildId] = data;
	}

	/**
	 * Merge data
	 * @param guildId
	 * @param data
	 */
	merge(guildId, data) {
		if (!this.loaded) {
			throw new Error("[JsonAdapter.merge] No data is currently loaded.");
		}

		throw new Error("[JsonAdapter.merge] Method not implemented.");
	}

	get loaded() {
		return this.data !== null;
	}
}
