import CommandEvent from "./command-event";
import CommandContext from "../commands/command-context";

/**
 * @extends CommandEvent
 */
export default class PreventableCommandEvent extends CommandEvent {
    prevented: boolean = false;

    /**
     * @param {CommandContext} context
     */
    constructor(context: CommandContext) {
        super(context);
    }

    /**
     * @param {boolean} [prevent
     */
    prevent(prevent = true): void {
        /**
         * @type {boolean}
         * @readonly
         */
        this.prevented = prevent;
    }
}
