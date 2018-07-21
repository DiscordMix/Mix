import Bot from "../core/bot";

export interface BehaviourOptions {
    readonly name: string;
    readonly description?: string;
    readonly enabled: (bot: Bot, api?: any) => void;
    readonly disabled?: (bot: Bot, api?: any) => void;
    readonly canEnable?: (bot: Bot, api?: any) => boolean;
    readonly listeners?: Array<string>;
}

/**
 * @deprecated Use fragments instead
 */
export default class Behaviour {
    readonly name: string;
    readonly description: string;
    readonly enabled: (bot: Bot, api?: any) => void;
    readonly disabled?: (bot: Bot, api?: any) => void;
    readonly canEnable: ((bot: Bot, api?: any) => boolean) | boolean;
    readonly listeners: Array<string>;

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

        /**
         * @type {Array<string>}
         * @readonly
         */
        this.listeners = options.listeners || [];
    }
}
