import Bot from "../core/bot";

export interface BehaviourOptions {
    readonly name: string;
    readonly description?: string;
    readonly enabled: (bot: Bot) => void;
    readonly disabled?: (bot: Bot) => void;
    readonly canEnable?: (bot: Bot) => boolean;
}

export default class Behaviour {
    readonly name: string;
    readonly description: string;
    readonly enabled: (bot: Bot) => void;
    readonly disabled?: (bot: Bot) => void;
    readonly canEnable: ((bot: Bot) => boolean) | boolean;

    /**
     * @param {BehaviourOptions} options
     */
    constructor(options: BehaviourOptions) {
        /**
         * @type {string}
         * @readonly
         */
        this.name = options.name;

        /**
         * @type {string}
         * @readonly
         */
        this.description = options.description ? options.description : "No description provided";

        /**
         * @type {Function}
         */
        this.enabled = options.enabled;

        if (options.disabled) {
            /**
             * @type {Function|undefined}
             */
            this.disabled = options.disabled;
        }

        /**
         * @type {Function|boolean}
         */
        this.canEnable = options.canEnable ? options.canEnable : true;
    }
}
