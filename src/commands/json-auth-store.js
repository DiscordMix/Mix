import Utils from "../core/utils";
import ObjectAuthStore from "./object-auth-store";
import Log from "../core/log";

const fs = require("fs");

export default class JsonAuthStore extends ObjectAuthStore {
	/**
	 * @param {String} schemaPath
	 * @param {String} storePath
	 */
	constructor(schemaPath, storePath) {
		super(null, null);

		/**
		 * The path of the schema file
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.schemaPath = schemaPath;

		/**
		 * The path of the store file
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.storePath = storePath;

		this.reload();
	}

	/**
	 * @return {Promise}
	 */
	async reload() {
		if (!this.exists) {
			await Utils.writeJson(this.storePath, {});
			this.data = {};
		}
		else {
			this.data = await Utils.readJson(this.storePath);
		}

		if (!fs.existsSync(this.schemaPath)) {
			Log.throw(`[JsonAuthStore] Schema file path does not exist: ${this.schemaPath}`);
		}

		this.schema = await Utils.readJson(this.schemaPath);
	}

	/**
	 * @return {Boolean} Whether the store file exists
	 */
	get exists() {
		return fs.existsSync(this.storePath);
	}
}
