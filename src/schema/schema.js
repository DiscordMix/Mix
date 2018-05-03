const _ = require("lodash");

export default class Schema {
	/**
	 * @param {Object} struct
	 * @param {Object} schema
	 * @returns {Boolean} Whether the schema is valid
	 */
	static validate(struct, schema) {
		const keys = Object.keys(schema);

		for (let i = 0; i < keys.length; i++) {
			const value = _.get(struct, keys[i]);

			let type = schema[keys[i]];

			if (typeof type === "string") {
				if (type.startsWith("?")) {
					type = type.substring(1);

					if (value === undefined) {
						continue;
					}
				}

				if (typeof value !== type) {
					return false;
				}
			}
			else if (typeof type === "object" || typeof type === "function") {
				if (!(value instanceof type)) {
					return false;
				}
			}
			else {
				throw new Error(`[Schema.validate] Expecting string or object type but got '${typeof type}'`);
			}
		}

		return true;
	}
}
