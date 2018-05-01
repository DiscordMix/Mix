import Log from "./log";

const fs = require("fs");
const _ = require("lodash");

export default class UserConfig {
	/**
	 * @param {string} path
	 */
	constructor(path) {
		if (fs.existsSync(path)) {
			this.path = path;
			this.config = JSON.parse(fs.readFileSync(path).toString());
		}
		else {
			Log.error("Could not load user config: File does not exist");
		}
	}

	/**
	 * @param {string} path
	 * @param {*} value
	 * @param {(Snowflake|null)} guildId
	 * @param {string} template
	 */
	set(path, value, guildId = null, template = "default") {
		const finalPath = guildId ? `${guildId}.${path}` : path;

		Log.info(finalPath);

		if (this.get(`${template}.${path}`, guildId) === value) {
			_.unset(this.config, finalPath);
		}
		else {
			_.set(this.config, finalPath, value);
			Log.info(`set ${finalPath} to ${value}`);
		}

		this.save();
	}

	/**
	 * @param {string} path
	 * @param {(Snowflake|null)} guildId
	 * @param {string} template
	 * @returns {*}
	 */
	get(path, guildId = null, template = "default") {
		const finalPath = guildId ? `${guildId}.${path}` : path;

		if (!this.contains(path, guildId)) {
			return _.get(this.config, `${template}.${path}`);
		}

		return _.get(this.config, finalPath);
	}

	/**
	 * @param {string} path
	 * @param {*} item
	 * @param {(Snowflake|null)} guildId
	 */
	push(path, item, guildId = null) {
		const items = this.get(path, guildId).slice(0);

		items.push(item);
		this.set(path, items, guildId);
	}

	/**
	 * @param {string} path
	 * @param {(Snowflake|null)} guildId
	 * @returns {boolean}
	 */
	contains(path, guildId = null) {
		const finalPath = guildId ? `${guildId}.${path}` : path;

		return _.has(this.config, finalPath);
	}

	/**
	 * @param {Snowflake} id
	 */
	createGuild(id) {
		this.set(id, {});
		this.save();
	}

	/**
	 * @param {Snowflake} id
	 */
	removeGuild(id) {
		delete this.config[id];
		this.save();
	}

	save() {
		fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
	}
}
