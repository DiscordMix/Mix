export default class Feature {
    readonly name: string;
    readonly key: string;
    readonly description: string;

    /**
     * @param {String} name The name of the feature
     * @param {String} key
     * @param {String} description The description of the feature
     */
    constructor(name: string, key: string, description: string) {
        /**
         * @type {String}
         * @readonly
         */
        this.name = name;

        /**
         * @type {String}
         * @readonly
         */
        this.key = key;

        /**
         * @type {String}
         * @readonly
         */
        this.description = description;
    }

    // TODO: Throw methods not implemented
}
