import DataProvider from "./data-provider";

const _ = require("lodash");

/**
 * @extends DataProvider
 */
export default class ObjectProvider extends DataProvider {
    protected data: any;

    /**
     * @param {Object} data
     */
    constructor(data: any) {
        super();

        /**
         * @type {object|null}
         * @private
         */
        this.data = data;
    }

    /**
     * Retrieve guild data
     * @param {string} path
     * @return {Object}
     */
    get(path: string): any {
        return _.get(this.data, path);
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} value
     */
    set(path: string, value: any): void {
        _.set(this.data, path, value);
    }

    /**
     * @todo
     * Merge guild data
     * @param {string} path
     * @param {*} value
     */
    merge(path: string, value: any): void {
        throw new Error("[ObjectProvider.merge] Method not implemented.");
    }
}
