import DataStore from "./data-store";

const mongodb = require("mongodb");

/**
 * @extends DataStore
 */
export default class MongodbStore extends DataStore {
    /**
     * @param {String} url
     */
    constructor(url) {
        super();

        /**
         * @type {String}
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
     * @param {String} database The database name
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
     * @param {String} path
     * @returns {*}
     */
    get(path) {
        throw new Error("[MongoDb.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @param {String} path
     * @param {*} data
     */
    set(path, data) {
        throw new Error("[MongoDb.set] Method not implemented.");
    }

    /**
     * Merge guild data
     * @param {String} path
     * @param {*} data
     */
    merge(path, data) {
        throw new Error("[MongoDb.merge] Method not implemented.");
    }
}
