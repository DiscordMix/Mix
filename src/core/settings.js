import Log from "./log";

const fs = require("fs");

export default class Settings {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		if (fs.existsSync(path)) {
			this.path = path;

			const jsonObj = JSON.parse(fs.readFileSync(path).toString());

			// TODO: should be automatic
			this.general = jsonObj.general;
			this.keys = jsonObj.keys;
			this.log = jsonObj.log;
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
			log: this.log,
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
