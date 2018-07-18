import CommandAuthStore from "../commands/auth-stores/command-auth-store";
import DataProvider from "../data-providers/data-provider";

export default class ConfigBuilder {
    private readonly properties: any;

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
        this.properties.paths.commandStore = path;

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
     * @param {DataProvider} dataStore
     * @return {ConfigBuilder}
     */
    setDataStore(dataStore: DataProvider): ConfigBuilder {
        this.properties.dataStore = dataStore;

        return this;
    }

    /**
     * @return {Object}
     */
    build(): any {
        return this.properties;
    }
}
