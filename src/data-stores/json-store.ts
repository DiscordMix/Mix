import ObjectStore from "./object-store";

const fs = require("fs");
const _ = require("lodash");

/**
 * @extends ObjectStore
 */
export default class JsonStore extends ObjectStore {
    private readonly path: string;

    /**
     * @param {string} path
     */
    constructor(path: string) {
        super(null);

        /**
         * @type {string}
         * @private
         * @readonly
         */
        this.path = path;
    }

    /**
     * Reload the data from the source file
     * @return {Promise<*>}
     */
    async reload(): Promise<any> {
        this.validate();

        return new Promise((resolve) => {
            fs.readFile(this.path, (error: any, data: any) => {
                if (error) {
                    throw error;
                }

                this.data = JSON.parse(data.toString());
                resolve();
            });
        });
    }

    /**
     * @todo Return type
     * Save the data into the source file
     * @return {Promise<void>}
     */
    async save(): Promise<any> {
        this.validate();

        return new Promise((resolve) => {
            fs.writeFile(this.path, JSON.stringify(this.data), (error: any) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * Ensure that the source file exists
     */
    validate() {
        if (!fs.existsSync(this.path)) {
            throw new Error(`[JsonAdapter] Path does not exist: ${this.path}`);
        }
    }

    /**
     * Retrieve guild data
     * @param {string} path
     * @return {*}
     */
    get(path: string) {
        if (!this.loaded) {
            throw new Error("[JsonStore.get] No data is currently loaded.");
        }

        return _.get(this.data, path);
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} value
     */
    set(path: string, value: any) {
        if (!this.loaded) {
            throw new Error("[JsonStore.set] No data is currently loaded.");
        }

        _.set(this.data, path, value);
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} value
     */
    merge(path: string, value: any) {
        if (!this.loaded) {
            throw new Error("[JsonStore.merge] No data is currently loaded.");
        }

        throw new Error("[JsonStore.merge] Method not implemented.");
    }

    /**
     * Determine whether any data is loaded
     * @return {boolean} Whether any data is currently loaded
     */
    get loaded(): boolean {
        return this.data !== null;
    }
}
