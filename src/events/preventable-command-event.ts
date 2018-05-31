import CommandEvent from "./command-event";
import CommandExecutionContext from "../commands/command-execution-context";

/**
 * @extends CommandEvent
 */
export default class PreventableCommandEvent extends CommandEvent {
    prevented: boolean = false;

    /**
     * @param {CommandExecutionContext} context
     */
    constructor(context: CommandExecutionContext) {
        super(context);
    }

    /**
     * @param {Boolean} [prevent
     */
    prevent(prevent = true) {
        /**
         * @type {Boolean}
         * @readonly
         */
        this.prevented = prevent;
    }
}
