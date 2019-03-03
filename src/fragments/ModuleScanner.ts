import Log from "../core/Log";

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

    /**
     * Specify the pattern(s) which the file names must match.
     */
    public match(...patterns: RegExp[]): this {
        this.patterns = patterns;

        return this;
    }

    /**
     * Initiate the scan.
     * @return {string[]} The matching files found.
     */
    public scan(): string[] {
        // TODO
        throw Log.notImplemented;
    }
}
