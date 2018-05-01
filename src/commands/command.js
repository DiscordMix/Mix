export default class Command {
	/**
	 * @param {string} base
	 * @param {string} description
	 * @param {array<string>} aliases
	 * @param {(string|null)} extendedDescription
	 * @param {number} maxArguments
	 * @param {AccessLevelType} accessLevel
	 * @param {function} onExecuted
	 * @param {function} canExecute
	 * @param {CommandCategoryType} category
	 * @param {object} args
	 * @param {boolean} isEnabled
	 * @param {number} price
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
	 * @param {object} module
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
