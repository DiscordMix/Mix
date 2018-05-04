import ObjectStore from "./object-store";

const fs = require("fs");
const _ = require("lodash");

/**
 * @extends ObjectStore
 */
export default class JsonStore extends ObjectStore {
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
	 * @param {String} path
	 * @returns {*}
	 */
	get(path) {
		if (!this.loaded) {
			throw new Error("[JsonStore.get] No data is currently loaded.");
		}

		return _.get(this.data, path);
	}

	/**
	 * Set guild data
	 * @param {String} path
	 * @param {*} value
	 */
	set(path, value) {
		if (!this.loaded) {
			throw new Error("[JsonStore.set] No data is currently loaded.");
		}

		_.set(this.data, path, value);
	}

	/**
	 * Merge guild data
	 * @param {String} path
	 * @param {*} value
	 */
	merge(path, value) {
		if (!this.loaded) {
			throw new Error("[JsonStore.merge] No data is currently loaded.");
		}

		throw new Error("[JsonStore.merge] Method not implemented.");
	}

	/**
	 * Determine whether any data is loaded
	 * @return {Boolean} Whether any data is currently loaded
	 */
	get loaded() {
		return this.data !== null;
	}
}
