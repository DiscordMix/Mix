import {IBuilder} from "..";

export interface IConfigBuilder extends IBuilder<object> {
    commandsPath(path: string): this
    settingsPath(path: string): this;
    argumentTypes(argumentTypes: object): this;
}

export default class ConfigBuilder implements IConfigBuilder {
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
    public commandsPath(path: string): this {
        this.properties.paths.commandStore = path;

        return this;
    }

    /**
     * @param {string} path
     * @return {ConfigBuilder}
     */
    public settingsPath(path: string): this {
        this.properties.paths.settings = path;

        return this;
    }

    /**
     * @param {object} argumentTypes
     * @return {ConfigBuilder}
     */
    public argumentTypes(argumentTypes: object): this {
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
