import CommandEvent from "./command-event";
import CommandContext from "../commands/command-context";
import Command from "../commands/command";

/**
 * @extends CommandEvent
 */
export default class CommandExecutedEvent extends CommandEvent {
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
