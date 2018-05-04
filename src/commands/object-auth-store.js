import CommandAuthStore from "./command-auth-store";
import Log from "../core/log";

const Typer = require("@raxor1234/typer");

export default class ObjectAuthStore extends CommandAuthStore {
	/**
	 * @param {Object} schema
	 * @param {Object} data
	 */
	constructor(schema, data) {
		super();

		/**
		 * @type {Object}
		 * @protected
		 */
		this.schema = schema;

		/**
		 * @type {Object}
		 * @protected
		 */
		this.data = data;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {*} identifier
	 * @return {Number}
	 */
	getAuthLevel(guildId, identifier) {
		const authLevels = this.data[guildId];

		for (let i = 0; i < authLevels.length; i++) {
			if (authLevels[i].includes(identifier)) {
				return i;
			}
		}

		return null;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @return {Number}
	 */
	getHighestAuthLevelByRoles(guildId, roles) {
		let highest = 0;

		for (let i = 0; i < roles.length; i++) {
			const authLevel = this.getAuthLevel(guildId, roles[i]);

			if (authLevel > highest) {
				highest = authLevel;
			}
		}

		return highest;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Snowflake} userId
	 * @param {Array<String>} roles
	 * @return {Number} The authority of the user
	 */
	getAuthority(guildId, userId, roles = ["@everyone"]) {
		const byRoles = this.getHighestAuthLevelByRoles(guildId, roles);
		const byId = this.getAuthLevel(guildId, userId);

		if (byRoles > byId) {
			return byRoles;
		}

		return byId;
	}

	/**
	 * Create a default auth store entry
	 * @param {Snowflake} guildId
	 * @return {Boolean} Whether the entry was created
	 */
	create(guildId) {
		if (!this.contains(guildId)) {
			const schemaKeys = Object.keys(this.schema);
			const entry = [];

			let seenDefault = false;

			for (let i = 0; i < schemaKeys.length; i++) {
				const authLevel = this.schema[schemaKeys[i]];

				if (schemaKeys[i].toLowerCase() === "default") {
					if (seenDefault) {
						Log.throw("[ObjectAuthStore] Auth schema may not contain more than one default auth level");
					}

					const validDefault = Typer.validate({
						rank: "!number"
					}, authLevel);

					if (!validDefault) {
						Log.throw("[ObjectAuthStore] Unable to create default auth store entry: Invalid default auth level");
					}

					seenDefault = true;
				}

				entry[authLevel.rank] = [];
			}

			if (!seenDefault) {
				Log.throw("[ObjectAuthStore] Auth schema does not contain a default auth level");
			}

			this.data[guildId] = entry;
			this.emit("guildCreated", guildId);

			return true;
		}

		Log.error(`[ObjectAuthStore.create] Trying to create an already existing entry: ${guildId}`);

		return false;
	}

	/**
	 * Remove an auth store entry
	 * @param {Snowflake} guildId
	 * @return {Boolean} Whether the entry was removed
	 */
	remove(guildId) {
		Log.throw("[ObjectAuthStore.remove] Method not implemented");
	}

	/**
	 * Determine whether this auth store contains an entry
	 * @param {Snowflake} guildId
	 * @return {Boolean} Whether the entry exists
	 */
	contains(guildId) {
		return this.data[guildId] !== undefined;
	}
}
