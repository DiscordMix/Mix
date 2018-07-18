import ObjectProvider from "./object-provider";
import Log from "../core/log";
import Utils from "../core/utils";

const fs = require("fs");
const _ = require("lodash");

/**
 * @extends ObjectProvider
 */
export default class JsonProvider extends ObjectProvider {
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
        await this.validate();

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
     * @return {Promise<*>}
     */
    async save(): Promise<any> {
        await this.validate();

        return Utils.writeJson(this.path, this.data);
    }

    /**
     * Ensure that the source file exists
     */
    async validate(): Promise<void> {
        if (!fs.existsSync(this.path)) {
            // TODO: Commented out
            // throw new Error(`[JsonAdapter] Path does not exist: ${this.path}`);
            Log.info("[JsonAdapter] Data source does not exist, creating default");

            await Utils.writeJson(this.path, {});
        }
    }

    /**
     * Retrieve guild data
     * @param {string} path
     * @return {*}
     */
    get(path: string): any {
        if (!this.loaded) {
            throw new Error("[JsonProvider.get] No data is currently loaded.");
        }

        return _.get(this.data, path);
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} value
     */
    set(path: string, value: any): void {
        if (!this.loaded) {
            throw new Error("[JsonProvider.set] No data is currently loaded.");
        }

        _.set(this.data, path, value);
    }

    /**
     * @param {string} path
     * @param value
     * @param {boolean} create
     * @return {boolean}
     */
    push(path: string, value: any, create: boolean = true): boolean {
        const currentValue: any = _.get(this.data, path);

        if (Array.isArray(currentValue)) {
            currentValue.push(value);
            this.set(path, currentValue);

            return true;
        }
        else if (create) {
            this.set(path, [value]);

            return true;
        }

        return false;
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} value
     */
    merge(path: string, value: any): void {
        if (!this.loaded) {
            throw new Error("[JsonProvider.merge] No data is currently loaded.");
        }

        throw new Error("[JsonProvider.merge] Method not implemented.");
    }

    /**
     * Determine whether any data is loaded
     * @return {boolean} Whether any data is currently loaded
     */
    get loaded(): boolean {
        return this.data !== null;
    }
}
