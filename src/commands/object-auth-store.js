import AccessLevelType from "./access-level-type";
import CommandAuthStore from "./command-auth-store";

export default class ObjectAuthStore extends CommandAuthStore {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		super(path);
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Snowflake} userId
	 * @returns {AccessLevelType}
	 */
	getAuthLevelById(guildId, userId) {
		if (this.isDeveloper(userId)) {
			return AccessLevelType.Developer;
		}

		const authLevels = this.bot.dataAdapter.get("access-levels", guildId);
		const keys = Object.keys(authLevels);

		for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
			// TODO: Use index of instead of looping
			for (let roleIdx = 0; roleIdx < authLevels[keys[keyIdx]].length; roleIdx++) {
				const value = authLevels[keys[keyIdx]][roleIdx];

				if (!isNaN(value) && value === userId.toString()) {
					return AccessLevelType.fromString(keys[keyIdx]);
				}
			}
		}

		return null;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {String} role
	 * @returns {AccessLevelType}
	 */
	getAuthLevelByRole(guildId, role) {
		const authLevels = this.data[guildId];
		const keys = Object.keys(authLevels);

		for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			for (let roleIndex = 0; roleIndex < authLevels[keys[keyIndex]].length; roleIndex++) {
				if (authLevels[keys[keyIndex]][roleIndex] === role) {
					return AccessLevelType.fromString(keys[keyIndex]);
				}
			}
		}

		return null;
	}

	/**
	 * @deprecated
	 * @param {Snowflake} userId
	 * @returns {Boolean}
	 */
	isDeveloper(userId) {
		return this.bot.dataAdapter.get("global.developers").includes(userId);
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @returns {Number}
	 */
	getHighestAuthLevelByRoles(guildId, roles) {
		let highest = 0;

		for (let i = 0; i < roles.length; i++) {
			const authLevel = this.getAuthLevelByRole(guildId, roles[i]);

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
	 * @returns {Number} The authority of the user
	 */
	getAuthority(guildId, userId, roles = ["@everyone"]) {
		const byRoles = this.getHighestAuthLevelByRoles(guildId, roles);
		const byId = this.getAuthLevelById(guildId, userId);

		if (byRoles > byId) {
			return byRoles;
		}

		return byId;
	}
}
