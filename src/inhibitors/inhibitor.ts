import CommandContext from "../commands/command-context";
import {IFragment, IFragmentMeta} from "../fragments/fragment";

export interface IInhibitorOptions {
    readonly meta: IFragmentMeta;
    readonly inspector: (context: CommandContext) => void;
}

export default class Inhibitor implements IFragment {
    public readonly meta: IFragmentMeta;
    public readonly inspector: (context: CommandContext) => void;

    /**
     * @param {IInhibitorOptions} options
     */
    public constructor(options: IInhibitorOptions) {
        /**
         * @type {IInhibitorMeta}
         * @readonly
         */
        this.meta = options.meta;

        /**
         * @type {(context: Context) => void}
         * @readonly
         */
        this.inspector = options.inspector;
    }
}
