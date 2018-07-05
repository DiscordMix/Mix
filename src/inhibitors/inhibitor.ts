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
    readonly meta: InhibitorMeta;
    readonly inspector: (context: CommandContext) => void;

    constructor(options: InhibitorOptions) {
        this.meta = options.meta;
        this.inspector = options.inspector;
    }
}