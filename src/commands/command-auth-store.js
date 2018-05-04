import Log from "../core/log";

export default class CommandAuthStore {
	/**
	 * @abstract
	 * @param {Snowflake} guildId
	 * @param {*} identifier
	 * @returns {Number}
	 */
	getAuthLevel(guildId, identifier) {
		Log.throw("[CommandAuthStore] Method not implemented");
	}

	/**
	 * @abstract
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @returns {Number}
	 */
	getHighestAuthLevelByRoles(guildId, roles) {
		Log.throw("[CommandAuthStore] Method not implemented");
	}

	/**
	 * @abstract
	 * @param {Snowflake} guildId
	 * @param {Snowflake} userId
	 * @param {Array<String>} roles
	 * @returns {Number} The authority of the user
	 */
	getAuthority(guildId, userId, roles = ["@everyone"]) {
		Log.throw("[CommandAuthStore] Method not implemented");
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Discord.Message} message
	 * @param {Number} authLevel
	 * @returns {Boolean}
	 */
	hasAuthority(guildId, message, authLevel) {
		return this.getAuthority(guildId, message.author.id, message.member.roles.array().map((role) => role.name)) >= authLevel;
	}
}
