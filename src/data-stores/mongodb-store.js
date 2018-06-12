import DataStore from "./data-store";

const mongodb = require("mongodb");

/**
 * @extends DataStore
 */
export default class MongodbStore extends DataStore {
    /**
     * @param {string} url
     */
    constructor(url) {
        super();

        /**
         * @type {string}
         * @private
         * @readonly
         */
        this.url = url;

        /**
         * @type {MongoClient}
         * @private
         * @readonly
         */
        this.client = mongodb.MongoClient;

        /**
         * @type {*}
         * @private
         */
        this.db = null;
    }

    /**
     * @param {string} database The database name
     */
    connect(database) {
        this.client.connect(this.url, (error, db) => {
            if (error) {
                throw error;
            }

            this.db = db.db(database);
        });
    }

    /**
     * Retrieve guild data
     * @param {string} path
     * @return {*}
     */
    get(path) {
        throw new Error("[MongoDb.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} data
     */
    set(path, data) {
        throw new Error("[MongoDb.set] Method not implemented.");
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} data
     */
    merge(path, data) {
        throw new Error("[MongoDb.merge] Method not implemented.");
    }
}
