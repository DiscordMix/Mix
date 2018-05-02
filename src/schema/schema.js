import Log from "../core/log";

const _ = require("lodash");

export default class Schema {
	static validate(struct, schema) {
		const keys = Object.keys(schema);

		for (let i = 0; i < keys.length; i++) {
			if (typeof schema[keys[i]] === "string") {
				if (typeof _.get(struct, keys[i]) !== schema[keys[i]]) {
					return false;
				}
			}
			else if (typeof schema[keys[i]] === "object") {
				if (!(_.get(struct, keys[i]) instanceof schema[keys[i]])) {
					return false;
				}
			}
			else {
				throw new Error(`[Schema.validate] Expecting string or object type but got '${typeof schema[keys[i]]}'`);
			}
		}

		return true;
	}
}
