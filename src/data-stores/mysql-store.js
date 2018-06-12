import DataStore from "./data-store";

const mysql = require("mysql");
const _ = require("lodash");

/**
 * @extends DataStore
 */
export default class MysqlStore extends DataStore {
    /**
     * @param {Object} data
     */
    constructor(data) {
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
     * @return {Promise<MysqlStore>}
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.connection.connect((err) => {
                if (err) {
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
     * @return {Promise<MysqlStore>}
     */
    disconnect() {
        return new Promise((resolve, reject) => {
            this.connection.end((err) => {
                if (err) {
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
     * @param {*} args
     * @param {number} [timeout=5000]
     * @return {Promise<Object>}
     */
    query(query, args = [], timeout = 5000) {
        return new Promise((resolve, reject) => {
            this.connection.query({
                sql: query,
                values: args,
                timeout: timeout
            }, (error, results, fields) => {
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
     * Retrieve guild data
     * @param {string} path
     * @param {(Snowflake|null)} [guildId=null]
     * @return {Promise}
     */
    async get(path, guildId = null) {
        if (!this.loaded) {
            throw new Error("[MysqlStore.get] No data is currently loaded.");
        }

        let query = "SELECT * FROM ?? WHERE id = ?";

        const splitPath = MysqlStore.cleanPath(path, guildId);

        if (splitPath.length === 1) {
            query = "SELECT * FROM ??";
        }

        const { results, fields } = await this.query(query, splitPath);

        if (splitPath.length === 1) {
            const rtn = [];
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
     * Set guild data
     * @param {string} path
     * @param {*} value
     * @param {(Snowflake|null)} [guildId=null]
     * @return {Promise<Object>}
     */
    async set(path, value, guildId = null) {
        if (!this.loaded) {
            throw new Error("[MysqlStore.set] No data is currently loaded.");
        }

        const query = "UPDATE ?? SET ??=? WHERE  `id`=?;";
        const splitPath = MysqlStore.cleanPath(path, guildId);

        if (splitPath.length < 3) {
            throw new Error(`[MysqlAdapter.set] Invalid path: ${path}`);
        }

        const { results, fields } = await this.query(query, [
            splitPath[0],
            splitPath[2],
            value,
            splitPath[1]
        ]);

        return { results, fields };
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} value
     * @param {(Snowflake|null)} [guildId=null]
     */
    merge(path, value, guildId = null) {
        if (!this.loaded) {
            throw new Error("[MysqlStore.merge] No data is currently loaded.");
        }

        throw new Error("[MysqlStore.merge] Method not implemented.");
    }

    /**
     * @param {string} path
     * @param {Snowflake} guildId
     * @return {Array<string>}
     */
    static cleanPath(path, guildId) {
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
