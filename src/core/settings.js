import Log from "./log";

const fs = require("fs");

export default class Settings {
	constructor(filePath) {
		if (fs.existsSync(filePath)) {
			this.path = filePath;

			const jsonObj = JSON.parse(fs.readFileSync(filePath).toString());

			// TODO: should be automatic
			this.general = jsonObj.general;
			this.keys = jsonObj.keys;
			this.log = jsonObj.log;
		}
		else {
			Log.error("Could not load settings: File does not exist");
		}
	}

	save() {
		fs.writeFileSync(this.path, JSON.stringify({
			general: this.general,
			log: this.log,
			keys: this.keys
		}, null, 4));
	}

	validate() {
		if (this.general.token === null) {
			Log.error("[Settings] Token cannot be null or empty");
		}
	}
}
