import JsonStore from "../data-stores/json-store";
import AccessLevelType from "./access-level-type";

export default class CommandAuthorizationStore extends JsonStore {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		super(path);
	}

	/**
	 * @param {String} role
	 * @returns {Number}
	 */
	_getAuthLevelByRole(role) {
		const keys = Object.keys(this.data);

		for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
			const items = this.data[keys[keyIdx]].items;

			// TODO
		}
	}

	/**
	 * @deprecated
	 * @param {Snowflake} guildId
	 * @param {String} role
	 * @returns {AccessLevelType}
	 */
	getAccessLevelByRole(guildId, role) {
		const accessLevels = this.bot.dataAdapter.get("access-levels", guildId);
		const keys = Object.keys(accessLevels);

		for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			for (let roleIndex = 0; roleIndex < accessLevels[keys[keyIndex]].length; roleIndex++) {
				if (accessLevels[keys[keyIndex]][roleIndex] === role) {
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
	 * @deprecated
	 * @param {Snowflake} guildId
	 * @param {Snowflake} userId
	 * @returns {AccessLevelType}
	 */
	getAccessLevelById(guildId, userId) {
		if (this.isDeveloper(userId)) {
			return AccessLevelType.Developer;
		}

		const accessLevels = this.bot.dataAdapter.get("access-levels", guildId);
		const keys = Object.keys(accessLevels);

		for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			// TODO: Use index of instead of looping
			for (let roleIndex = 0; roleIndex < accessLevels[keys[keyIndex]].length; roleIndex++) {
				const value = accessLevels[keys[keyIndex]][roleIndex];

				if (!isNaN(value) && value === userId.toString()) {
					return AccessLevelType.fromString(keys[keyIndex]);
				}
			}
		}

		return null;
	}

	/**
	 * @deprecated
	 * @param {Discord.Message} message
	 * @param {String} role
	 * @returns {Boolean}
	 */
	hasRole(message, role) {
		return message.member.roles.find("name", role) !== null;
	}

	/**
	 * @deprecated
	 * @param {Discord.Message} message
	 * @param {Array<String>} roles
	 * @returns {Boolean}
	 */
	hasRoles(message, roles) {
		for (let i = 0; i < roles.length; i++) {
			if (!this.hasRole(message, roles[i])) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @deprecated
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @returns {AccessLevelType}
	 */
	getHighestAccessLevelByRoles(guildId, roles) {
		let highest = AccessLevelType.Guest;

		for (let i = 0; i < roles.length; i++) {
			const accessLevel = this.getAccessLevelByRole(guildId, roles[i]);

			if (accessLevel > highest) {
				highest = accessLevel;
			}
		}

		return highest;
	}

	/**
	 * @deprecated
	 * @param {Snowflake} guildId
	 * @param {Message} message
	 * @param {AccessLevelType} accessLevel
	 * @returns {Boolean}
	 */
	hasAuthority(guildId, message, accessLevel) {
		return this.getAuthority(guildId, message.member.roles.array().map((role) => role.name), message.author.id) >= accessLevel;

		// TODO: Replaced by getAuthority() method
		// return (this.getHighestAccessLevelByRoles(message.member.roles.array().map((role) => role.name)) >= accessLevel) || (this.getAccessLevelById(message.author.id) >= accessLevel);
	}

	/**
	 * @deprecated
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @param {Snowflake} userId
	 * @returns {AccessLevelType} The authority of the user
	 */
	getAuthority(guildId, roles = ["@everyone"], userId) {
		const byRoles = this.getHighestAccessLevelByRoles(guildId, roles);
		const byId = this.getAccessLevelById(guildId, userId);

		if (byRoles > byId) {
			return byRoles;
		}

		return byId;
	}
}
