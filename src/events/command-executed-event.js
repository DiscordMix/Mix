import CommandEvent from "./command-event";

/**
 * @extends CommandEvent
 */
export default class CommandExecutedEvent extends CommandEvent {
    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command
     */
    constructor(context,  command) {
        super(context);

        /**
         * @type {Command}
         */
        this.command = command;
    }
}
