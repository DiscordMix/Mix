export default abstract class DataProvider<ItemType = any> {
    /**
     * Retrieve guild data
     * @abstract
     * @param {string} path
     * @return {ItemType}
     */
    public abstract get(path: string): ItemType;

    /**
     * Set guild data
     * @abstract
     * @param {string} path
     * @param {*} value
     * @return {ItemType}
     */
    public abstract set(path: string, value: any): ItemType;
}
