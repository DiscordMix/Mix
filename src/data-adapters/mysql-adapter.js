import DataAdapter from "./data-adapter";

const mysql = require('mysql');
const _ = require("lodash");

export default class MysqlAdapter extends DataAdapter {
	constructor(data) {
		super();

		this.data = data;
		this.connection = mysql.createConnection(data);
		this.connected = false;
	}

	connect() {
		return new Promise((resolve, reject) => {
			this.connection.connect((err) => {
				if (err) {
					reject(reject);
				} else {
					this.connected = true;
					resolve(this);
				}
			});
		});
	}

	disconnect() {
		return new Promise((resolve, reject) => {
			this.connection.end((err) => {
				if (err) {
					reject(reject);
				} else {
					this.connected = false;
					resolve(this);
				}
			});
		});
	}

	query(query, args = [], timeout = 5000) {
		return new Promise((resolve, reject) => {
			this.connection.query({
				sql: query,
				values: args,
				timeout: timeout
			}, (error, results, fields) => {
				if (error) {
					reject(error);
				} else {
					resolve({
						results: results,
						fields: fields
					});
				}
			});
		});
	}

	/**
	 * Retrieve guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @returns {Promise}
	 */
	async get(path, guildId = null) {
		if (!this.loaded) {
			throw new Error("[MySQLAdapter.get] No data is currently loaded.");
		}

		let query = "SELECT * FROM ?? WHERE id = ?";

		const splitPath = MysqlAdapter.cleanPath(path, guildId);

		if (splitPath.length === 1) {
			query = "SELECT * FROM ??";
		}

		const { results, fields } = await this.query(query, splitPath);

		if (splitPath.length === 1) {
			const rtn = [];
			for (let i = 0; i < results.length; i++) {
				const row = results[i];
				rtn[row.id] = row;
			}
			return rtn;
		}

		if (fields.length === 0) {
			return undefined;
		}

		if (splitPath.length === 2) {
			return results[0];
		} else if (splitPath.length === 3) {
			return results[0][splitPath[2]];
		}

		const column = results[0][splitPath[2]];
		const obj = JSON.parse(column);

		return _.get(obj, path.substr(path.substr(26).indexOf(".") + 27));
	}

	/**
	 * Set guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} data
	 */
	async set(path, value, guildId = null) {
		if (!this.loaded) {
			throw new Error("[MySQLAdapter.set] No data is currently loaded.");
		}

		const query = "UPDATE ?? SET ??=? WHERE  `id`=?;";

		const splitPath = MysqlAdapter.cleanPath(path, guildId);

		if (splitPath.length < 3) {
			throw new Error("[MySQLAdapter.set] Invalid path.");
		}

		const { results, fields } = await this.query(query, [
			splitPath[0],
			splitPath[2],
			value,
			splitPath[1]
		]);

		return { results, fields };
	}

	/**
	 * Merge guild data
	 * @param {Snowflake} guildId
	 * @param {String} path
	 * @param {*} data
	 */
	merge(path, value, guildId = null) {
		if (!this.loaded) {
			throw new Error("[MySQLAdapter.merge] No data is currently loaded.");
		}

		throw new Error("[MySQLAdapter.set] Method not implemented.");
	}

	static cleanPath(path, guildId) {
		return `${guildId ? `guilds.${guildId}.` : ""}${path}`.split('.');
	}

	get loaded() {
		return this.data !== null && this.connected;
	}
}
