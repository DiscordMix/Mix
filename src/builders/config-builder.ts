export default class ConfigBuilder {
    protected readonly properties: any;

    public constructor() {
        /**
         * @type {Object}
         * @protected
         * @readonly
         */
        this.properties = [];
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    public setCommandsPath(path: string): ConfigBuilder {
        this.properties.paths.commandStore = path;

        return this;
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    public setSettingsPath(path: string): ConfigBuilder {
        this.properties.paths.settings = path;

        return this;
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    public setEmojisPath(path: string): ConfigBuilder {
        this.properties.paths.emojis = path;

        return this;
    }

    /**
     * @param {Object} argumentTypes
     * @return {ConfigBuilder}
     */
    public setArgumentTypes(argumentTypes: any): ConfigBuilder {
        this.properties.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @return {Object}
     */
    public build(): any {
        return this.properties;
    }
}
