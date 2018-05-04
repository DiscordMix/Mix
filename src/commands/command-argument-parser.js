export default class CommandArgumentParser {
	/**
	 * @param {String} type
	 * @param {String} arg
	 * @param {Object} resolvers
	 * @returns {*}
	 */
	static resolve(type, arg, resolvers) {
		const keys = Object.keys(resolvers);

		for (let i = 0; i < keys.length; i++) {
			if (keys[i] === type) {
				return resolvers[keys[i]](arg);
			}
		}

		throw new Error(`[CommandArgumentParser.resolve] Missing argument resolver: ${type}`);
	}
}
