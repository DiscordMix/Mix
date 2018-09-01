import DataProvider from "./data-provider";

/**
 * @extends DataProvider
 */
export default class SqliteProvider extends DataProvider {
    /**
     * Retrieve guild data
     * @param {string} path
     * @return {*}
     */
    public get(path: string): any {
        throw new Error("[SqliteProvider.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} value
     */
    public set(path: string, value: any): void {
        throw new Error("[SqliteProvider.set] Method not implemented.");
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} value
     */
    public merge(path: string, value: any): void {
        throw new Error("[SqliteProvider.merge] Method not implemented.");
    }
}
