import CommandAuthStore from "./command-auth-store";

export default class ObjectAuthStore extends CommandAuthStore {
	/**
	 * @param {String} data
	 */
	constructor(data) {
		super();

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
}
