import Log from "../logging/log";
import {PromiseOr} from "@atlas/xlib";
import Util from "../core/util";

export interface IModuleScanner {
    match(...patterns: RegExp[]): this;
    scan(): PromiseOr<string[]>;
}

/**
 * Provides ability to discover modules
 */
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

    /**
     * Scan the base path for file names matching the specified patterns
     * @return {Promise<string[]>}
     */
    public async scan(): Promise<string[]> {
        const files: string[] | null = await Util.getFiles(this.basePath);

        if (files === null) {
            throw Log.error("Base path does not exist");
        }

        const result: string[] = [];

        for (const file of files) {
            for (const pattern of this.patterns) {
                if (pattern.test(file)) {
                    result.push(file);
                }
            }
        }

        return result;
    }
}
