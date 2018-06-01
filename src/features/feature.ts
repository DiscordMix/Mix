import Bot from "../core/bot";

export default abstract class Feature {
    readonly name: string;
    readonly key: string;
    readonly description: string;

    isEnabled: boolean = false;

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

    /**
     * @param {Bot} bot
     */
    abstract enabled(bot: Bot): void;

    /**
     * @param {Bot} bot
     */
    abstract disabled(bot: Bot): void;

    /**
     * @param {Bot} bot
     * @return {boolean}
     */
    abstract canEnable(bot: Bot): boolean;
}
