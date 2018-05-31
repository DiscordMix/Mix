import CommandEvent from "./command-event";
import CommandExecutionContext from "../commands/command-execution-context";
import Command from "../commands/command";

/**
 * @extends CommandEvent
 */
export default class CommandExecutedEvent extends CommandEvent {
    readonly command: Command;

    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command
     */
    constructor(context: CommandExecutionContext,  command: Command) {
        super(context);

        /**
         * @type {Command}
         */
        this.command = command;
    }
}
