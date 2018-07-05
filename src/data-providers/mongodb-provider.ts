import DataProvider from "./data-provider";

const mongodb = require("mongodb");

/**
 * @extends DataProvider
 */
export default class MongodbProvider extends DataProvider {
    readonly url: string;
    readonly client: any;

    private db: any;

    /**
     * @param {string} url
     */
    constructor(url: string) {
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
     * @todo Should return a boolean indicating whether connected or not
     * @param {string} database The database name
     */
    connect(database: string): void {
        this.client.connect(this.url, (error: Error, db: any) => {
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
    get(path: string): any {
        throw new Error("[MongoDb.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} data
     */
    set(path: string, data: any): void {
        throw new Error("[MongoDb.set] Method not implemented.");
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} data
     */
    merge(path: string, data: any): void {
        throw new Error("[MongoDb.merge] Method not implemented.");
    }
}
