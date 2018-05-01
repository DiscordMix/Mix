export default class CommandWillExecuteEvent {
	/**
	 * @param {Command} command
	 * @param {CommandExecutionContext} context
	 * @param {function} prevent
	 */
	constructor(command, context, prevent) {
		this.command = command;
		this.context = context;
		this.prevent = prevent;
	}
}
