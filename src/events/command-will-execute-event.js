export default class CommandWillExecuteEvent {
	/**
	 * @param {Command} command
	 * @param {CommandExecutionContext} context
	 * @param {Function} prevent
	 */
	constructor(command, context, prevent) {
		/**
		 * @type {Command}
		 */
		this.command = command;

		/**
		 * @type {CommandExecutionContext}
		 */
		this.context = context;

		/**
		 * @type {Function}
		 */
		this.prevent = prevent;
	}
}
