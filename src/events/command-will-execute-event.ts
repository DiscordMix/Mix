import PreventableCommandEvent from "./preventable-command-event";
import CommandExecutionContext from "../commands/command-execution-context";
import Command from "../commands/command";

/**
 * @extends PreventableCommandEvent
 */
export default class CommandWillExecuteEvent extends PreventableCommandEvent {
    readonly command: Command;

    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command
     */
    constructor(context: CommandExecutionContext, command: Command) {
        super(context);

        /**
         * @type {Command}
         */
        this.command = command;
    }
}
