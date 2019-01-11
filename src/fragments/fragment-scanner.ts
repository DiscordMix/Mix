import {Log} from "..";

export interface IFragmentScanner {
    match(...patterns: RegExp[]): this;
    scan(): string[];
}

export default class FragmentScanner implements IFragmentScanner {
    protected patterns: RegExp[];
    protected basePath: string;

    public constructor(basePath: string) {
        this.basePath = basePath;
        this.patterns = [];
    }

    public match(...patterns: RegExp[]): this {
        this.patterns = patterns;

        return this;
    }

    public scan(): string[] {
        // TODO
        throw Log.notImplemented;
    }
}
