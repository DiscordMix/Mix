export default class CommandExecutedEvent {
    /**
     * @param {Command} command
     * @param {CommandExecutionContext} context
     */
    constructor(command, context) {
        /**
         * @type {Command}
         */
        this.command = command;

        /**
         * @type {CommandExecutionContext}
         */
        this.context = context;
    }
}
