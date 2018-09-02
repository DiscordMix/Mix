import DataProvider from "./data-provider";
import Log from "../core/log";
import {Snowflake} from "discord.js";
import mysql from "mysql";
import {default as _} from "lodash";

/**
 * @extends DataProvider
 */
export default class MysqlProvider extends DataProvider {
    private readonly connection: any;

    readonly data: any;

    // TODO: Can be modified externally
    connected: boolean;

    /**
     * @param {Object} data
     */
    constructor(data: any) {
        super();

        /**
         * @type {Object}
         * @private
         */
        this.data = data;

        /**
         * @type {*}
         * @private
         * @readonly
         */
        this.connection = mysql.createConnection(data);

        /**
         * @type {boolean}
         * @private
         */
        this.connected = false;
    }

    /**
     * Connect to the database
     * @return {Promise<MysqlProvider>}
     */
    connect(): Promise<MysqlProvider> {
        return new Promise((resolve, reject) => {
            this.connection.connect((error: Error) => {
                // TODO: Should throw error instead?
                if (error) {
                    reject(reject);
                }
                else {
                    this.connected = true;
                    resolve(this);
                }
            });
        });
    }

    /**
     * Disconnect from the database
     * @return {Promise<MysqlProvider>}
     */
    disconnect(): Promise<MysqlProvider> {
        return new Promise((resolve, reject) => {
            this.connection.end((error: Error) => {
                // TODO: Should throw error instead?
                if (error) {
                    reject(reject);
                }
                else {
                    this.connected = false;
                    resolve(this);
                }
            });
        });
    }

    /**
     * Execute a query in the database
     * @param {string} query
     * @param {Array<*>} args
     * @param {number} [timeout=5000]
     * @return {Promise<Object>}
     */
    query(query: string, args: Array<any> = [], timeout = 5000): Promise<object> {
        return new Promise((resolve, reject) => {
            this.connection.query({
                sql: query,
                values: args,
                timeout: timeout
            }, (error: Error, results: any, fields: any) => {
                // TODO: Should throw error instead?
                if (error) {
                    reject(error);
                }
                else {
                    resolve({
                        results: results,
                        fields: fields
                    });
                }
            });
        });
    }

    /**
     * @todo Instead of setting Snowflake to null use ? (typescript) instead
     * Retrieve guild data
     * @param {string} path
     * @param {Snowflake | null} [guildId=null]
     * @return {Promise}
     */
    async get(path: string, guildId: Snowflake | null = null) {
        if (!this.loaded) {
            Log.error("[MysqlProvider.get] No data is currently loaded.");

            return;
        }

        let query = "SELECT * FROM ?? WHERE id = ?";

        // TODO: Temporary "" default value hotfix
        const splitPath: any = MysqlProvider.cleanPath(path, guildId ? guildId : "");

        if (splitPath.length === 1) {
            query = "SELECT * FROM ??";
        }

        const queryResult: any = await this.query(query, splitPath);
        const results = queryResult.results;
        const fields = queryResult.fields;

        if (splitPath.length === 1) {
            const rtn: Array<any> = [];

            for (let i = 0; i < results.length; i++) {
                const row = results[i];

                rtn[row.id] = row;
            }

            return rtn;
        }

        if (fields.length === 0) {
            return undefined;
        }
        else if (splitPath.length === 2) {
            return results[0];
        }
        else if (splitPath.length === 3) {
            return results[0][splitPath[2]];
        }

        const column = results[0][splitPath[2]];
        const obj = JSON.parse(column);

        return _.get(obj, path.substr(path.substr(26).indexOf(".") + 27));
    }

    /**
     * @todo Instead of setting Snowflake to null use ? (typescript) instead
     * Set guild data
     * @param {string} path
     * @param {*} value
     * @param {Snowflake | null} [guildId=null]
     * @return {Promise<Object>}
     */
    async set(path: string, value: any, guildId: Snowflake | null = null) {
        if (!this.loaded) {
            Log.error("[MysqlProvider.set] No data is currently loaded.");

            return;
        }

        const query = "UPDATE ?? SET ??=? WHERE  `id`=?;";

        // TODO: Temporary "" default value hotfix again
        const splitPath = MysqlProvider.cleanPath(path, guildId ? guildId : "");

        if (splitPath.length < 3) {
            throw new Error(`[MysqlAdapter.set] Invalid path: ${path}`);
        }

        const queryResult: any = await this.query(query, [
            splitPath[0],
            splitPath[2],
            value,
            splitPath[1]
        ]);

        return {
            results: queryResult.results,
            fields: queryResult.fields
        };
    }

    /**
     * @todo Instead of setting Snowflake to null use ? (typescript) instead
     * Merge guild data
     * @param {string} path
     * @param {*} value
     * @param {Snowflake | null} [guildId=null]
     */
    merge(path: string, value: any, guildId: Snowflake | null = null) {
        if (!this.loaded) {
            throw new Error("[MysqlProvider.merge] No data is currently loaded.");
        }

        throw new Error("[MysqlProvider.merge] Method not implemented.");
    }

    /**
     * @param {string} path
     * @param {Snowflake} guildId
     * @return {Array<string>}
     */
    static cleanPath(path: string, guildId: Snowflake) {
        return `${guildId ? `guilds.${guildId}.` : ""}${path}`.split(".");
    }

    /**
     * Determine whether any data is loaded
     * @return {boolean} Whether any data is currently loaded
     */
    get loaded() {
        return this.data !== null && this.connected;
    }
}
