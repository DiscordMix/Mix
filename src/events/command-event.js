export default class CommandEvent {
    /**
     * @param {CommandExecutionContext} context
     */
    constructor(context) {
        /**
         * @type {CommandExecutionContext}
         * @readonly
         */
        this.context = context;
    }
}
