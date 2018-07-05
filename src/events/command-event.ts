import CommandContext from "../commands/command-context";

export default class CommandEvent {
    readonly context: CommandContext;

    /**
     * @param {CommandContext} context
     */
    constructor(context: CommandContext) {
        /**
         * @type {CommandContext}
         * @readonly
         */
        this.context = context;
    }
}
