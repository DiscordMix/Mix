// import Collection from "../collections/collection";

// TODO: Implement the Collection class.
export default class FeatureManager /* extends Collection */ {
	/**
	 * @param {Bot} bot
	 * @param {Array<Feature>} features
	 */
	constructor(bot, features = []) {
		// super(features);

		/**
		 * @type {Array<Feature>}
		 * @private
		 * @readonly
		 */
		this.features = features;

		/**
		 * @type {Bot}
		 * @private
		 * @readonly
		 */
		this.bot = bot;
	}

	/**
	 * Enable a feature
	 * @param {Feature} feature
	 * @returns {Boolean}
	 */
	enable(feature) {
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
	 * @returns {Number}
	 */
	enableMultiple(features) {
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
	 * @returns {Number}
	 */
	enableAll() {
		return this.enableMultiple(this.features);
	}

	/**
	 * Disable a feature
	 * @param {Feature} feature
	 */
	disable(feature) {
		feature.disabled(this.bot);
		feature.isEnabled = false;
	}

	/**
	 * Disable multiple features at once
	 * @param {Array<Feature>} features
	 */
	disableMultiple(features) {
		for (let i = 0; i < features.length; i++) {
			this.disable(features[i], this.bot);
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
	 * @returns {Number}
	 */
	reloadAll() {
		this.disableAll();

		return this.enableAll();
	}

	// TODO: Replace by Collection's native methods
	/**
	 * Register a feature
	 * @param {Feature} feature
	 */
	register(feature) {
		this.features.push(feature);
	}

	/**
	 * Register multiple features at once
	 * @param {Array<Feature>} features
	 */
	registerMultiple(features) {
		for (let i = 0; i < features.length; i++) {
			this.register(features[i]);
		}
	}

	/**
	 * Determine whether a feature is registered
	 * @param {String} key
	 * @returns {Boolean}
	 */
	isRegistered(key) {
		return this.get(key) != null;
	}

	/**
	 * Determine whether a feature is enabled
	 * @param {String} key
	 * @returns {Boolean}
	 */
	isEnabled(key) {
		return this.get(key).isEnabled;
	}

	/**
	 * @param {String} key
	 * @returns {(Feature|Null)}
	 */
	get(key) {
		for (let i = 0; i < this.features.length; i++) {
			if (this.features[i].key === key) {
				return this.features[i];
			}
		}

		return null;
	}
}
