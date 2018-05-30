import Log from "../core/log";

const EventEmitter = require("events");

export default class CommandAuthStore extends EventEmitter {
    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {*} identifier
     * @returns {Number}
     */
    getAuthLevel(guildId, identifier) {
        Log.throw("[CommandAuthStore.getAuthLevel] Method not implemented");
    }

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {Array<String>} roles
     * @returns {Number}
     */
    getHighestAuthLevelByRoles(guildId, roles) {
        Log.throw("[CommandAuthStore.getHighestAuthLevelByRoles] Method not implemented");
    }

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {Snowflake} userId
     * @param {Array<String>} roles
     * @returns {Number} The authority of the user
     */
    getAuthority(guildId, userId, roles = ["@everyone"]) {
        Log.throw("[CommandAuthStore.getAuthority] Method not implemented");
    }

    /**
     * Create a default auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {Boolean} Whether the entry was created
     */
    create(guildId) {
        Log.throw("[CommandAuthStore.create] Method not implemented");
    }

    /**
     * Remove an auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {Boolean} Whether the entry was removed
     */
    remove(guildId) {
        Log.throw("[CommandAuthStore.remove] Method not implemented");
    }

    /**
     * Determine whether this auth store contains an entry
     * @param {Snowflake} guildId
     * @return {Boolean} Whether the entry exists
     */
    contains(guildId) {
        return this.data[guildId] !== undefined;
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
