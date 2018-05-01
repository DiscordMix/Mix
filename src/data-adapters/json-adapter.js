import ObjectAdapter from "./object-adapter";

const fs = require("fs");
const _ = require("lodash");

export default class JsonAdapter extends ObjectAdapter {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		super(null);

		/**
		 * @type {String}
		 * @private
		 */
		this.path = path;
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
	 * @param {String} path
	 * @returns {*}
	 */
	get(guildId, path) {
		if (!this.loaded) {
			throw new Error("[JsonAdapter.get] No data is currently loaded.");
		}

		return _.get(this.data, `${guildId}.${path}`);
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} value
	 */
	set(guildId, path, value) {
		if (!this.loaded) {
			throw new Error("[JsonAdapter.set] No data is currently loaded.");
		}

		_.set(this.data, `${guildId}.${path}`, value);
	}

	/**
	 * Merge guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} value
	 */
	merge(guildId, path, value) {
		if (!this.loaded) {
			throw new Error("[JsonAdapter.merge] No data is currently loaded.");
		}

		throw new Error("[JsonAdapter.merge] Method not implemented.");
	}

	get loaded() {
		return this.data !== null;
	}
}
