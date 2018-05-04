import Utils from "../core/utils";
import ObjectAuthStore from "./object-auth-store";

const fs = require("fs");

export default class JsonAuthStore extends ObjectAuthStore {
	/**
	 * @param {String} path
	 */
	constructor(path) {
		super(null);

		/**
		 * The path of the source file
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.path = path;

		this.reload();
	}

	/**
	 * @return {Promise}
	 */
	async reload() {
		if (!this.exists) {
			await Utils.writeJson(this.path, {});
			this.data = {};
		}
		else {
			this.data = await Utils.readJson(this.path);
		}
	}

	/**
	 * @return {Boolean} Whether the source file exists
	 */
	get exists() {
		return fs.existsSync(this.path);
	}
}
