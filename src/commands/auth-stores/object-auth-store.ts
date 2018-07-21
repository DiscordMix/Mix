import CommandAuthStore from "./command-auth-store";
import Log from "../../core/log";
import {Snowflake} from "discord.js";

/**
 * @extends CommandAuthStore
 */
export default class ObjectAuthStore extends CommandAuthStore {
    protected data: any;

    /**
     * @param {Object} schema
     * @param {Object} data
     */
    constructor(schema: any, data: any) {
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
     * @return {number}
     */
    getAuthLevel(guildId: Snowflake, identifier: any): number {
        const authLevels = this.data[guildId];

        for (let i = 0; i < authLevels.length; i++) {
            if (authLevels[i].includes(identifier)) {
                return i;
            }
        }

        return 0;
    }

    /**
     * @param {Snowflake} guildId
     * @param {Array<string>} roles
     * @return {number}
     */
    getHighestAuthLevelByRoles(guildId: Snowflake, roles: Array<string>): number {
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
     * @param {Array<string>} roles
     * @return {number} The authority of the user
     */
    getAuthority(guildId: Snowflake, userId: Snowflake, roles: Array<string> = ["@everyone"]): number {
        const byRoles = this.getHighestAuthLevelByRoles(guildId, roles);
        const byId = this.getAuthLevel(guildId, userId);

        if (byRoles > byId) {
            return byRoles;
        }

        return byId;
    }

    /**
     * @param {string} guildId
     * @param {string} userId
     * @param {number} authLevel
     */
    setUserAuthority(guildId: string, userId: string, authLevel: number): boolean {
        if (!this.authLevelExists(authLevel)) {
            return false;
        }

        // TODO: Should start with @ for userIds
        console.log(this.data);

        if (!this.data[guildId][authLevel]) {
            for (let i: number = this.data[guildId].length; i < authLevel; i++) {
                this.data[guildId][i] = [];
            }
        }

        // TODO: What if the user already has other authLevel assigned somewhere else? Delete that one and set this one instead
        if (!this.data[guildId][authLevel].includes(userId)) {
            this.data[guildId][authLevel].push(userId);
        }

        return true;
    }

    /**
     * @param {number} authLevel
     * @return {boolean}
     */
    authLevelExists(authLevel: number): boolean {
        const schemaKeys = Object.keys(this.schema);

        for (let i: number = 0; i < schemaKeys.length; i++) {
            if (this.schema[schemaKeys[i]].rank == authLevel) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create a default auth store entry
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry was created
     */
    create(guildId: Snowflake): boolean {
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
     * @return {boolean} Whether the entry was removed
     */
    remove(guildId: Snowflake): boolean {
        Log.throw("[ObjectAuthStore.remove] Method not implemented");

        return false;
    }

    /**
     * Determine whether this auth store contains an entry
     * @param {Snowflake} guildId
     * @return {boolean} Whether the entry exists
     */
    contains(guildId: Snowflake): boolean {
        return Object.keys(this.data).includes(guildId);
    }
}
