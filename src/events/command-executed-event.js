export default class CommandExecutedEvent {
	constructor(command, context) {
		this.command = command;
		this.context = context;
	}
}
