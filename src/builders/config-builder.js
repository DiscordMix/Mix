export default class ConfigBuilder {
    constructor() {
        /**
         * @type {Object}
         * @private
         * @readonly
         */
        this.properties = [];
    }

    /**
     * @param {String} path
     * @return {ConfigBuilder}
     */
    setCommandsPath(path) {
        this.properties.paths.commands = path;

        return this;
    }

    /**
     * @param {CommandAuthStore} authStore
     * @returns {ConfigBuilder}
     */
    setAuthStore(authStore) {
        this.properties.authStore = authStore;

        return this;
    }

    /**
     * @param {String} path
     * @returns {ConfigBuilder}
     */
    setSettingsPath(path) {
        this.properties.paths.settings = path;

        return this;
    }

    /**
     * @param {String} path
     * @returns {ConfigBuilder}
     */
    setEmojisPath(path) {
        this.properties.paths.emojis = path;

        return this;
    }

    /**
     * @param {Object} argumentTypes
     * @returns {ConfigBuilder}
     */
    setArgumentTypes(argumentTypes) {
        this.properties.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @param {DataStore} dataStore
     * @returns {ConfigBuilder}
     */
    setDataStore(dataStore) {
        this.properties.dataStore = dataStore;

        return this;
    }

    /**
     * @return {Object}
     */
    build() {
        return this.properties;
    }
}
