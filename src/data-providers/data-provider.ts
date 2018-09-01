export default abstract class DataProvider {
    /**
     * Retrieve guild data
     * @abstract
     * @param {string} path
     * @return {*}
     */
    public abstract get(path: string): any;

    /**
     * Set guild data
     * @abstract
     * @param {string} path
     * @param {*} value
     * @return {*}
     */
    public abstract set(path: string, value: any): any;
}
