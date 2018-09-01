import DataProvider from "./data-provider";
import Log from "../core/log";

const MongoClient = require("mongodb").MongoClient;

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
         * @todo
         * @type {MongoClient}
         * @private
         * @readonly
         */
        //this.client = mongodb.MongoClient;

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
    public connect(database: string): void {
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
    public get(path: string): any {
        throw new Error("[MongoDb.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} data
     */
    public set(path: string, data: any): void {
        throw new Error("[MongoDb.set] Method not implemented.");
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} data
     */
    public merge(path: string, data: any): void {
        throw new Error("[MongoDb.merge] Method not implemented.");
    }
}

export class MongoDbProviderV2 {
    public readonly url: string;
    public readonly databaseName: string;

    // TODO: Type
    private client: any;

    // TODO: Type
    private database: any;

    constructor(url: string, database: string) {
        this.url = url;
        this.databaseName = database;
    }

    /**
     * Connect to the database
     * @return {Promise<void>}
     */
    public connect(): Promise<void> {
        return new Promise((resolve) => {
            // TODO: Client type
            MongoClient.connect(this.url, (error: Error, client: any) => {
                if (error) {
                    Log.error(`[MongoDbProviderV2.connect] Unable to connect: ${error.message}`);

                    resolve();

                    return;
                }

                this.client = client;
                this.database = this.client.db(this.databaseName);
                resolve();
            });
        });
    }

    // TODO: Return type
    public getClient(): any {
        return this.client;
    }

    // TODO: Return type
    public getDatabase(): any {
        return this.database;
    }

    /**
     * Close the connection
     * @return {boolean}
     */
    public close(): boolean {
        if (this.client) {
            this.client.close();

            return true;
        }

        return false;
    }
}
