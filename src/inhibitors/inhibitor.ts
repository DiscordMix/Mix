import CommandContext from "../commands/command-context";

export interface IInhibitorMeta {
    readonly name: string;
    readonly description: string;
}

export type IInhibitorOptions = {
    readonly meta: IInhibitorMeta;
    readonly inspector: (context: CommandContext) => void;
}

export default class Inhibitor {
    public readonly meta: IInhibitorMeta;
    public readonly inspector: (context: CommandContext) => void;

    /**
     * @param {IInhibitorOptions} options
     */
    constructor(options: IInhibitorOptions) {
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
