export default class RGB {
	/**
	 * @param {Number} red
	 * @param {Number} green
	 * @param {Number} blue
	 */
	constructor(red, green, blue) {
		/**
		 * @type {Number}
		 * @readonly
		 */
		this.red = red;

		/**
		 * @type {Number}
		 * @readonly
		 */
		this.green = green;

		/**
		 * @type {Number}
		 * @readonly
		 */
		this.blue = blue;
	}

	/**
	 * @returns {String}
	 */
	toString() {
		return `${this.red}, ${this.green}, ${this.blue}`;
	}
}
