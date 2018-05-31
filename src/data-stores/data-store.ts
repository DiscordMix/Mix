export default abstract class DataStore {
    /**
     * Retrieve guild data
     * @abstract
     * @param {String} path
     * @returns {*}
     */
    abstract get(path: string): any;

    /**
     * Set guild data
     * @abstract
     * @param {String} path
     * @param {*} value
     * @returns {*}
     */
    abstract set(path: string, value: any): any;
}
