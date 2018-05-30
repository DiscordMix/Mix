export default class DataStore {
    /**
     * Retrieve guild data
     * @abstract
     * @param {String} path
     * @returns {*}
     */
    get(path) {
        throw new Error("[DataStore.get] Method not implemented.");
    }

    /**
     * Set guild data
     * @abstract
     * @param {String} path
     * @param {*} value
     * @returns {*}
     */
    set(path, value) {
        throw new Error("[DataStore.set] Method not implemented.");
    }
}
