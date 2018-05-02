export default class Feature {
	/**
	 * @param {String} name The name of the feature
	 * @param {String} key
	 * @param {String} description The description of the feature
	 */
	constructor(name, key, description) {
		/**
		 * @type {String}
		 */
		this.name = name;

		/**
		 * @type {String}
		 */
		this.key = key;

		/**
		 * @type {String}
		 */
		this.description = description;
	}

	// TODO: Throw methods not implemented
}
