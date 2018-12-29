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
    public commandsPath(path: string): ConfigBuilder {
        this.properties.paths.commandStore = path;

        return this;
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    public settingsPath(path: string): ConfigBuilder {
        this.properties.paths.settings = path;

        return this;
    }

    /**
     * @param {object} argumentTypes
     * @return {ConfigBuilder}
     */
    public argumentTypes(argumentTypes: object): ConfigBuilder {
        this.properties.argumentTypes = argumentTypes;

        return this;
    }

    /**
     * @return {object}
     */
    public build(): object {
        return this.properties;
    }
}
