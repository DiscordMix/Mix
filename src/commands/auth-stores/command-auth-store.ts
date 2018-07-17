import {Message, Role, Snowflake} from "discord.js";

const EventEmitter = require("events");

/**
 * @todo CRITICAL (not here maybe) When loading auth store .json, if it's empty (not containing "[]") it will throw "Unexpected end of JSON" error
 * @extends EventEmitter
 */
export default abstract class CommandAuthStore extends EventEmitter {
    schema: any;

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {*} identifier
     * @return {number}
     */
    abstract getAuthLevel(guildId: Snowflake, identifier: any): number;

    /**
     * @abstract
     * @param {Snowflake} guildId
     * @param {Array<string>} roles
     * @return {number}
     */
    abstract getHighestAuthLevelByRoles(guildId: Snowflake, roles: Array<string>): number;

    /**
     * @todo TYPESCRIPT Fix initializer in implementations (not allowed in typescript abstract methods)
     * @abstract
     * @param {Snowflake} guildId
     * @param {Snowflake} userId
     * @param {Array<string>} roles
     * @return {number} The authority of the user
     */
    abstract getAuthority(guildId: Snowflake, userId: Snowflake, roles: Array<string>/* = ["@everyone"]*/): number;

    /**
     * Create a default auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry was created
     */
    abstract create(guildId: Snowflake): boolean;

    /**
     * Remove an auth store entry
     * @abstract
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry was removed
     */
    abstract remove(guildId: Snowflake): boolean;

    /**
     * Manage the Auth Level of an user
     * @param {Snowflake} guildId
     * @param {Snowflake} userId
     * @param {number} authLevel
     */
    abstract setUserAuthority(guildId: Snowflake, userId: Snowflake, authLevel: number): boolean;

    /**
     * Determine whether this auth store contains an entry
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry exists
     */
    abstract contains(guildId: Snowflake): boolean;

    /**
     * @param {Snowflake} guildId
     * @param {Discord.Message} message
     * @param {number} authLevel
     * @return {boolean}
     */
    hasAuthority(guildId: Snowflake, message: Message, authLevel: number): boolean {
        // TODO: Message.member may return undefined in private channels (DMs)
        return this.getAuthority(guildId, message.author.id, message.member.roles.array().map((role: Role) => role.name)) >= authLevel;
    }

    /**
     * @param {number} rank
     * @return {string|null}
     */
    getSchemaRankName(rank: number): string | null {
        const keys = Object.keys(this.schema);

        for (let i = 0; i < keys.length; i++) {
            if (this.schema[keys[i]].rank === rank) {
                return keys[i];
            }
        }

        return null;
    }
}
