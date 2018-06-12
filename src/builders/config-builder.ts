import CommandAuthStore from "../commands/command-auth-store";
import DataStore from "../data-stores/data-store";

export default class ConfigBuilder {
    private properties: any;

    constructor() {
        /**
         * @type {Object}
         * @private
         * @readonly
         */
        this.properties = [];
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    setCommandsPath(path: string): ConfigBuilder {
        this.properties.paths.commands = path;

        return this;
    }

    /**
     * @param {CommandAuthStore} authStore
     * @return {ConfigBuilder}
     */
    setAuthStore(authStore: CommandAuthStore): ConfigBuilder {
        this.properties.authStore = authStore;

        return this;
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    setSettingsPath(path: string): ConfigBuilder {
        this.properties.paths.settings = path;

        return this;
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    setEmojisPath(path: string): ConfigBuilder {
        this.properties.paths.emojis = path;

        return this;
    }

    /**
     * @param {Object} argumentTypes
     * @return {ConfigBuilder}
     */
    setArgumentTypes(argumentTypes: any): ConfigBuilder {
        this.properties.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @param {DataStore} dataStore
     * @return {ConfigBuilder}
     */
    setDataStore(dataStore: DataStore): ConfigBuilder {
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
