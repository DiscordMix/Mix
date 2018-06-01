import DataStore from "./data-store";

const _ = require("lodash");

/**
 * @extends DataStore
 */
export default class ObjectStore extends DataStore {
    protected data: any;

    /**
     * @param {object} data
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
     * @return {object}
     */
    get(path: string): any {
        return _.get(this.data, path);
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} value
     */
    set(path: string, value: any) {
        _.set(this.data, path, value);
    }

    /**
     * @todo
     * Merge guild data
     * @param {string} path
     * @param {*} value
     */
    merge(path: string, value: any) {
        throw new Error("[ObjectStore.merge] Method not implemented.");
    }
}
