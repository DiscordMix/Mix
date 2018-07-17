import PreventableCommandEvent from "./preventable-command-event";
import CommandContext from "../commands/command-context";
import Command from "../commands/command";

/**
 * @extends PreventableCommandEvent
 */
export default class CommandWillExecuteEvent extends PreventableCommandEvent {
    readonly command: Command;

    /**
     * @param {CommandContext} context
     * @param {Command} command
     */
    constructor(context: CommandContext, command: Command) {
        super(context);

        /**
         * @type {Command}
         * @readonly
         */
        this.command = command;
    }
}
