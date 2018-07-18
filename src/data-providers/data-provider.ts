export default abstract class DataProvider {
    /**
     * Retrieve guild data
     * @abstract
     * @param {string} path
     * @return {*}
     */
    abstract get(path: string): any;

    /**
     * Set guild data
     * @abstract
     * @param {string} path
     * @param {*} value
     * @return {*}
     */
    abstract set(path: string, value: any): any;
}
