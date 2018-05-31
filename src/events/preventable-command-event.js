import CommandEvent from "./command-event";

/**
 * @extends CommandEvent
 */
export default class PreventableCommandEvent extends CommandEvent {
    /**
     * @param {CommandExecutionContext} context
     */
    constructor(context) {
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
