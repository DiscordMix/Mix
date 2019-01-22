import Log from "../core/log";

export interface IModuleScanner {
    match(...patterns: RegExp[]): this;
    scan(): string[];
}

export default class ModuleScanner implements IModuleScanner {
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
