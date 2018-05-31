import Log from "../core/log";
import {Message, Snowflake} from "discord.js";

const EventEmitter = require("events");

/**
 * @extends EventEmitter
 */
export default abstract class CommandAuthStore extends EventEmitter {
    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {*} identifier
     * @returns {Number}
     */
    abstract getAuthLevel(guildId: Snowflake, identifier: any): number;

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {Array<String>} roles
     * @returns {Number}
     */
    abstract getHighestAuthLevelByRoles(guildId: Snowflake, roles: Array<string>): number;

    /**
     * @todo TYPESCRIPT Fix initializer in implementations (not allowed in typescript abstract methods)
     * @abstract
     * @param {Snowflake} guildId
     * @param {Snowflake} userId
     * @param {Array<String>} roles
     * @return {Number} The authority of the user
     */
    abstract getAuthority(guildId: Snowflake, userId: Snowflake, roles: Array<string>/*  = ["@everyone"]*/): number;

    /**
     * Create a default auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {Boolean} Whether the entry was created
     */
    abstract create(guildId: Snowflake): boolean;

    /**
     * Remove an auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {Boolean} Whether the entry was removed
     */
    abstract remove(guildId: Snowflake): boolean;

    /**
     * Determine whether this auth store contains an entry
     * @param {Snowflake} guildId
     * @return {Boolean} Whether the entry exists
     */
    contains(guildId: Snowflake) {
        return Object.keys(this.data).includes(guildId);
    }

    /**
     * @param {Snowflake} guildId
     * @param {Discord.Message} message
     * @param {Number} authLevel
     * @returns {Boolean}
     */
    hasAuthority(guildId: Snowflake, message: Message, authLevel: number): boolean {
        return this.getAuthority(guildId, message.author.id, message.member.roles.array().map((role) => role.name)) >= authLevel;
    }
}
