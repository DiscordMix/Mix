import Bot from "../core/bot";

export default abstract class Feature {
    readonly name: string;
    readonly key: string;
    readonly description: string;

    isEnabled: boolean = false;

    /**
     * @param {string} name The name of the feature
     * @param {string} key
     * @param {string} description The description of the feature
     */
    constructor(name: string, key: string, description: string) {
        /**
         * @type {string}
         * @readonly
         */
        this.name = name;

        /**
         * @type {string}
         * @readonly
         */
        this.key = key;

        /**
         * @type {string}
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
