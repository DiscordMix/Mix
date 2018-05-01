export default class RGB {
	/**
	 * @param {number} red
	 * @param {number} green
	 * @param {number} blue
	 */
	constructor(red, green, blue) {
		this.red = red;
		this.green = green;
		this.blue = blue;
	}

	/**
	 * @returns {string}
	 */
	toString() {
		return `${this.red}, ${this.green}, ${this.blue}`;
	}
}
