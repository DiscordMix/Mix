import DataAdapter from "./data-adapter";

/**
 * @extends DataAdapter
 */
export default class MongoDbAdapter extends DataAdapter {
	/**
	 * @param {String} url
	 */
	constructor(url) {
		super();

		/**
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.url = url;

		/**
		 * @type {MongoClient}
		 * @private
		 * @readonly
		 */
		this.client = require("mongodb").MongoClient;

		/**
		 * @type {*}
		 * @private
		 */
		this.db = null;
	}

	/**
	 * @param {String} database The database name
	 */
	connect(database) {
		this.client.connect(this.url, (error, db) => {
			if (error) {
				throw error;
			}

			this.db = db.db(database);
		});
	}

	/**
	 * Retrieve guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @returns {*}
	 */
	get(guildId, path) {
		throw new Error("[MongoDb.get] Method not implemented.");
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} data
	 */
	set(guildId, path, data) {
		throw new Error("[MongoDb.set] Method not implemented.");
	}

	/**
	 * Merge guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} data
	 */
	merge(guildId, path, data) {
		throw new Error("[MongoDb.merge] Method not implemented.");
	}
}
