import Log from "./log";

const fs = require("fs");

export default class Settings {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		if (fs.existsSync(path)) {
			/**
			 * @type {String}
			 * @private
			 * @readonly
			 */
			this.path = path;

			const jsonObj = JSON.parse(fs.readFileSync(path).toString());

			// TODO: Should be automatic
			// TODO: Should be validated using Schema
			/**
			 * @type {Object}
			 * @readonly
			 */
			this.general = jsonObj.general;

			/**
			 * @type {Object}
			 * @readonly
			 */
			this.keys = jsonObj.keys;
		}
		else {
			Log.error("Could not load settings: File does not exist");
		}
	}

	/**
	 * Save the local settings into path
	 */
	save() {
		fs.writeFileSync(this.path, JSON.stringify({
			general: this.general,
			keys: this.keys
		}, null, 4));
	}

	// TODO
	validate() {
		if (this.general.token === null) {
			Log.error("[Settings] Token cannot be null or empty");
		}
	}
}
