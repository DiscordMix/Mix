import Log from "../core/log";
import Utils from "../core/utils";
import fs from "fs";
import {default as _} from "lodash";
import {IVolatile, ISyncable} from "../core/structures";

/**
 * @extends ObjectProvider
 */
export default class JsonProvider implements IVolatile, ISyncable {
    private readonly path: string;
    
    private data: any;

    /**
     * @param {string} path
     */
    public constructor(path: string) {
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
    public async sync(): Promise<any> {
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
    public async save(): Promise<any> {
        await this.validate();

        return Utils.writeJson(this.path, this.data);
    }

    /**
     * Ensure that the source file exists
     * @return {Promise<void>}
     */
    public async validate(): Promise<void> {
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
    public get(path: string): any {
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
    public set(path: string, value: any): void {
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
    public push(path: string, value: any, create: boolean = true): boolean {
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
    public merge(path: string, value: any): void {
        if (!this.loaded) {
            throw new Error("[JsonProvider.merge] No data is currently loaded.");
        }

        throw new Error("[JsonProvider.merge] Method not implemented.");
    }

    /**
     * Determine whether any data is loaded
     * @return {boolean} Whether any data is currently loaded
     */
    public get loaded(): boolean {
        return this.data !== null;
    }
}
