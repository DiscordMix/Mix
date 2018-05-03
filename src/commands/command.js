export default class Command {
	/**
	 * @param {String} base
	 * @param {String} description
	 * @param {Array<String>} aliases
	 * @param {AccessLevelType} accessLevel
	 * @param {Function} onExecuted
	 * @param {Function} canExecute
	 * @param {CommandCategoryType} category
	 * @param {Object} args
	 * @param {Boolean} isEnabled
	 */
	constructor(base, description, aliases, accessLevel, onExecuted, canExecute, category, args, isEnabled) {
		/**
		 * @type {String}
		 * @readonly
		 */
		this.base = base;

		/**
		 * @type {String}
		 * @readonly
		 */
		this.description = description;

		/**
		 * @type {Array<String>}
		 * @readonly
		 */
		this.aliases = aliases;

		/**
		 * @type {AccessLevelType}
		 * @readonly
		 */
		this.accessLevel = accessLevel;

		/**
		 * @type {Function}
		 * @readonly
		 */
		this.executed = onExecuted;

		/**
		 * @type {Function}
		 * @readonly
		 */
		this.canExecute = canExecute;

		/**
		 * @type {CommandCategoryType}
		 * @readonly
		 */
		this.category = category;

		/**
		 * @type {Array<String>}
		 * @readonly
		 */
		this.args = args;

		/**
		 * @type {Boolean}
		 * @readonly
		 */
		this.isEnabled = isEnabled;
	}

	get maxArguments() {
		const keys = Object.keys(this.args);

		let result = 0;

		for (let i = 0; i < keys.length; i++) {
			if (this.args[keys[i]].startsWith("!")) {
				result++;
			}
		}

		return result;
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
			module.meta.accessLevel,
			module.executed,
			module.canExecute,
			module.meta.category,
			module.meta.args,
			module.meta.enabled
		);
	}
}
