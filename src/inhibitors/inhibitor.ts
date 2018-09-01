import CommandContext from "../commands/command-context";

export interface InhibitorMeta {
    readonly name: string;
    readonly description: string;
}

export interface InhibitorOptions {
    readonly meta: InhibitorMeta;
    readonly inspector: (context: CommandContext) => void;
}

export default class Inhibitor {
    public readonly meta: InhibitorMeta;
    public readonly inspector: (context: CommandContext) => void;

    /**
     * @param {InhibitorOptions} options
     */
    constructor(options: InhibitorOptions) {
        /**
         * @type {InhibitorMeta}
         * @readonly
         */
        this.meta = options.meta;

        /**
         * @type {(context: CommandContext) => void}
         * @readonly
         */
        this.inspector = options.inspector;
    }
}
