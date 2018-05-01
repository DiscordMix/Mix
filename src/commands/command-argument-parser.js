import Log from '../core/log';

export default class CommandArgumentParser {
	// TODO: Fully review, might contain bugs or be incomplete.
	/**
	 * @param {object} rules
	 * @param {object} args
	 * @param {object} types
	 * @returns {boolean}
	 */
	static validate(rules, args, types = {}) {
		const ruleKeys = Object.keys(rules);

		for (let ruleIdx = 0; ruleIdx < ruleKeys.length; ruleIdx++) {
			const ruleName = ruleKeys[ruleIdx]; // name:
			const rule = rules[ruleName];

			if (/^!?[a-zA-Z|_:]+$/.test(rule) === false) {
				throw new Error(`CommandArgumentParser.Validator: Invalid rule: ${rule}`);
			}

			const typeSplit = rules[ruleName].split("|"); // ["string", "number"]

			for (let typeIdx = 0; typeIdx < typeSplit.length; typeIdx++) {
				let type = typeSplit[typeIdx];

				Log.info(`Checking ${ruleName}@${typeSplit[typeIdx]}`);

				if (type.startsWith("!")) {
					if (typeSplit.length > 1 && typeIdx > 0) {
						throw new Error(`CommandArgumentParser.Validator: Having a required argument along with an OR operator is not allowed`);
					}
					else if (args[ruleName] == null || args[ruleName] === undefined) {
						Log.info("Failed: Important not present.");

						return false;
					}

					type = type.substring(1);
				}

				if (args[ruleName]) {
					if (type[0] === ":") {
						const actualType = type.substring(1);

						if (!Object.keys(types).includes(actualType)) {
							throw new Error(`CommandArgumentParser.Validator: Custom argument type not registered: ${actualType}`);
						}
						// TODO: Check if it's a Regex instead of just checking method
						else if (types[actualType] instanceof RegExp) {
							break;
						}
						else if (typeof types[actualType] === "function" && types[actualType](args[ruleName])) {
							break;
						}
						else if (typeIdx === typeSplit.length - 1) {
							Log.info("Failed: check on CUSTOM-type first or last item not passed");

							return false;
						}
					}
					else if (typeof args[ruleName] === type) {
						break;
					}
					else if (typeIdx === typeSplit.length - 1) {
						Log.info("Failed: check on PRIMAL-type first or last item not passed");

						return false;
					}
				}
				else {
					break;
				}
			}
		}

		return true;
	}

	static resolve(type, arg, resolvers) {
		const keys = Object.keys(resolvers);

		for (let i = 0; i < keys.length; i++) {
			if (keys[i] === type) {
				return resolvers[keys[i]](arg);
			}
		}

		throw new Error(`[CommandArgumentParser] Missing argument resolver: ${type}`);
	}
}
