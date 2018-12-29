import Context from "../commands/command-context";
import {ICommandEvent} from "./command-event";

/**
 * @extends ICommandEvent
 */
export default class PreventableCommandEvent implements ICommandEvent {
    public readonly context: Context;

    protected prevented: boolean = false;

    /**
     * @param {Context} context
     */
    public constructor(context: Context) {
        /**
         * @type {Context}
         * @readonly
         */
        this.context = context;
    }

    /**
     * @param {boolean} [prevent=true]
     */
    public prevent(prevent: boolean = true): void {
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
