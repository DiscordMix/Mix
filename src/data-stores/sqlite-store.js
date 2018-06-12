import DataStore from "./data-store";

/**
 * @extends DataStore
 */
export default class SqliteStore extends DataStore {
    /**
     * Retrieve guild data
     * @param {string} path
     * @return {*}
     */
    get(path) {
        throw new Error("[SqliteStore.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @param {string} path
     * @param {*} value
     */
    set(path, value) {
        throw new Error("[SqliteStore.set] Method not implemented.");
    }

    /**
     * Merge guild data
     * @param {string} path
     * @param {*} value
     */
    merge(path, value) {
        throw new Error("[SqliteStore.merge] Method not implemented.");
    }
}
