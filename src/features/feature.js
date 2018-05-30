export default class Feature {
    /**
     * @param {String} name The name of the feature
     * @param {String} key
     * @param {String} description The description of the feature
     */
    constructor(name, key, description) {
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
