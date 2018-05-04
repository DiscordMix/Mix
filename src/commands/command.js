const Typer = require("@raxor1234/typer/typer");

export default class Command {
	/**
	 * @param {Object} data
	 */
	constructor(data) {
		// Setup the command from the provided object
		this.setup(data);
	}

	/**
	 * @todo [CRITICAL] Reflect default data changes throughout project
	 * Setup the command from an object
	 * @param {Object} data
	 */
	setup(data) {
		/**
		 * @type {String}
		 * @readonly
		 */
		this.name = data.name;

		/**
		 * @type {String}
		 * @readonly
		 */
		this.description = data.desc;

		/**
		 * @type {Array<String>}
		 * @readonly
		 */
		this.aliases = data.aliases ? data.aliases : [];

		/**
		 * @type {AccessLevelType}
		 * @readonly
		 */
		this.authLevel = data.authLevel;

		/**
		 * @type {Function}
		 * @readonly
		 */
		this.executed = data.executed;

		/**
		 * @type {Function}
		 * @readonly
		 */
		this.canExecute = data.canExecute ? data.canExecute : true;

		/**
		 * @type {CommandCategoryType}
		 * @readonly
		 */
		this.category = data.category;

		/**
		 * @type {Object}
		 * @readonly
		 */
		this.args = data.args ? data.args : {};

		/**
		 * @type {Boolean}
		 * @readonly
		 */
		this.isEnabled = data.isEnabled !== null ? module.meta.enabled : true;
	}

	/**
	 * @return {Number} The maximum amount of arguments that this command can accept
	 */
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
	 * Validate a command module
	 * @param {Object} data The module to validate
	 * @return {Boolean} Whether the module is valid
	 */
	static validate(data) {
		return Typer.validate({
			name: "!string",
			desc: "!string",
			authLevel: "!number",
			category: "!number",
			executed: "!function",
			canExecute: "function",
			args: "object",
			aliases: ":array",
			isEnabled: "boolean",
		}, data, {
			array: (val) => val instanceof Array
		});
	}
}
