import CommandExecutionContext from "../commands/command-execution-context";

export default class CommandEvent {
    readonly context: CommandExecutionContext;

    /**
     * @param {CommandExecutionContext} context
     */
    constructor(context: CommandExecutionContext) {
        /**
         * @type {CommandExecutionContext}
         * @readonly
         */
        this.context = context;
    }
}
