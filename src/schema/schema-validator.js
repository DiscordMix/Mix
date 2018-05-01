const _ = require("lodash");

export default class SchemaValidator {
  static validate(struct, schema) {
    const keys = Object.keys(schema);

    for (let i = 0; i < keys.length; i++) {
      if (typeof _.get(struct, keys[i]) !== schema[keys[i]]) {
        return false;
      }
    }

    return true;
  }
}
