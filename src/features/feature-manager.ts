// import Collection from "../collections/collection";

// TODO: Implement the Collection class.
import Bot from "../core/bot";
import Feature from "./feature";

export default class FeatureManager /* extends Collection */ {
    private readonly bot: Bot;
    private readonly features: Array<Feature>;

    /**
     * @param {Bot} bot
     * @param {Array<Feature>} features
     */
    constructor(bot: Bot, features: Array<Feature> = []) {
        // super(features);

        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {Array<Feature>}
         * @private
         * @readonly
         */
        this.features = features;
    }

    /**
     * Enable a feature
     * @param {Feature} feature
     * @return {boolean}
     */
    enable(feature: Feature): boolean {
        if (feature.canEnable(this.bot)) {
            feature.enabled(this.bot);
            feature.isEnabled = true;

            return true;
        }

        return false;
    }

    /**
     * Enable multiple features at once
     * @param {Array<Feature>} features
     * @return {Number}
     */
    enableMultiple(features: Array<Feature>): number {
        let totalEnabled = 0;

        for (let i = 0; i < features.length; i++) {
            if (this.enable(features[i])) {
                totalEnabled++;
            }
        }

        return totalEnabled;
    }

    /**
     * Enable all the currently registered features
     * @return {Number}
     */
    enableAll(): number {
        return this.enableMultiple(this.features);
    }

    /**
     * Disable a feature
     * @param {Feature} feature
     */
    disable(feature: Feature) {
        feature.disabled(this.bot);
        feature.isEnabled = false;
    }

    /**
     * Disable multiple features at once
     * @param {Array<Feature>} features
     */
    disableMultiple(features: Array<Feature>) {
        for (let i = 0; i < features.length; i++) {
            this.disable(features[i]);
        }
    }

    /**
     * Disable all the currently registered features
     */
    disableAll() {
        this.disableMultiple(this.features);
    }

    /**
     * Reload all currently registered and enabled features
     * @return {Number}
     */
    reloadAll(): number {
        this.disableAll();

        return this.enableAll();
    }

    // TODO: Replace by Collection's native methods
    /**
     * Register a feature
     * @param {Feature} feature
     */
    register(feature: Feature) {
        this.features.push(feature);
    }

    /**
     * Register multiple features at once
     * @param {Array<Feature>} features
     */
    registerMultiple(features: Array<Feature>) {
        for (let i = 0; i < features.length; i++) {
            this.register(features[i]);
        }
    }

    /**
     * Determine whether a feature is registered
     * @param {string} key
     * @return {boolean}
     */
    isRegistered(key: string): boolean {
        return this.get(key) != null;
    }

    /**
     * Determine whether a feature is enabled
     * @param {string} key
     * @return {boolean} Whether the feature is disabled, or null if the feature doesn't exist
     */
    isEnabled(key: string): boolean | null {
        const feature = this.get(key);

        if (feature) {
            return feature.isEnabled;
        }

        return null;
    }

    /**
     * @param {string} key
     * @return {Feature|null}
     */
    get(key: string): Feature | null {
        for (let i = 0; i < this.features.length; i++) {
            if (this.features[i].key === key) {
                return this.features[i];
            }
        }

        return null;
    }
}
