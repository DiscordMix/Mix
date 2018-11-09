import CommandContext from "../commands/command-context";
import {ICommandEvent} from "./command-event";

/**
 * @extends ICommandEvent
 */
export default class PreventableCommandEvent implements ICommandEvent {
    public readonly context: CommandContext;

    private prevented: boolean = false;

    /**
     * @param {CommandContext} context
     */
    public constructor(context: CommandContext) {
        this.context = context;
    }

    /**
     * @param {boolean} [prevent
     */
    public prevent(prevent = true): void {
        /**
         * @type {boolean}
         * @readonly
         */
        this.prevented = prevent;
    }

    /**
     * @return {boolean}
     */
    public isPrevented(): boolean {
        return this.prevented;
    }
}
