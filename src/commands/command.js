export default class Command {
	/**
	 * @param {String} base
	 * @param {String} description
	 * @param {Array<String>} aliases
	 * @param {(String|Null)} extendedDescription
	 * @param {Number} maxArguments
	 * @param {AccessLevelType} accessLevel
	 * @param {Function} onExecuted
	 * @param {Function} canExecute
	 * @param {CommandCategoryType} category
	 * @param {Object} args
	 * @param {Boolean} isEnabled
	 * @param {Number} price
	 */
	constructor(base, description, aliases, extendedDescription, maxArguments, accessLevel, onExecuted, canExecute, category, args, isEnabled, price) {
		this.base = base;
		this.description = description;
		this.aliases = aliases;
		this.extendedDescription = extendedDescription !== null ? extendedDescription : description;
		this.maxArguments = maxArguments;
		this.accessLevel = accessLevel;
		this.executed = onExecuted;
		this.canExecute = canExecute;
		this.category = category;
		this.args = args;
		this.isEnabled = isEnabled;
		this.price = price;
	}

	/**
	 * @param {Object} module
	 * @returns {Command}
	 */
	static fromModule(module) {
		return new Command(
			module.meta.name,
			module.meta.description,
			module.meta.aliases,
			null,
			module.meta.maxArguments,
			module.meta.accessLevel,
			module.executed,
			module.canExecute,
			module.meta.category,
			module.meta.args,
			module.meta.enabled,
			module.meta.price
		);
	}
}
