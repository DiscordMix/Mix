import PreventableCommandEvent from "./preventable-command-event";

/**
 * @extends PreventableCommandEvent
 */
export default class CommandWillExecuteEvent extends PreventableCommandEvent {
    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command
     */
    constructor(context, command) {
        super(context);

        /**
         * @type {Command}
         */
        this.command = command;
    }
}
