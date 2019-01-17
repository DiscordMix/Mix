import fs from "fs";
import Log from "../core/log";
import Util from "../core/util";
import {IFragment} from "./fragment";
import Patterns from "../core/patterns";

const validFragmentNamePattern: RegExp = /^(?:[a-z]{0,}[a-z0-9-_\S]+){2,50}$/i;
const validFragmentDescPattern: RegExp = /^(?:[a-z]{0,}[^\n\r\t\0]+){1,100}$/i;

export interface IPackage {
    readonly module: IFragment;
    readonly path: string;
}

/**
 * An instantiated package
 */
export interface ILivePackage<T extends IFragment> {
    readonly instance: T;
    readonly path: string;
}

/**
 * Utility class for loading fragments
 */
export default abstract class Loader {
    // TODO: Make use of the 'defaultOnly' parameter
    /**
     * @param {string} filePath The path to the file containing fragment
     * @param {boolean} [defaultOnly=false] Whether to only load the default exported module
     * @return {Promise<IPackage | null>}
     */
    public static async load(filePath: string, defaultOnly: boolean = false): Promise<IPackage | null> {
        if (!fs.existsSync(filePath)) {
            Log.warn(`Fragment path does not exist: ${filePath}`);

            return null;
        }

        try {
            let module: any = require(filePath);

            if (module === undefined || module === null) {
                return null;
            }

            const validEs6DefaultTypes = ["object", "function"];

            // Support for ES6 default module exports
            if (module.default !== undefined && validEs6DefaultTypes.includes(typeof module.default)) {
                module = module.default;
            }

            return {
                module,
                path: filePath
            };
        }
        catch (exception) {
            Log.warn(`There was an error while loading a fragment: ${exception}`);

            return null;
        }
    }

    /**
     * @todo Test and make sure it works
     * @param {string} file
     * @return {Promise<IPackage | null>}
     */
    public static async reload(file: string): Promise<IPackage | null> {
        // Delete path from Node's require cache
        delete require.cache[require.resolve(file)];

        return Loader.load(file);
    }

    /**
     * Determine whether a fragment is valid
     * @param {IFragment} fragment
     * @return {boolean}
     */
    public static validate(fragment: IFragment): boolean {
        if (!fragment.meta) {
            return false;
        }
        else if (Util.isEmpty(fragment.meta.name)) {
            return false;
        }
        else if (!validFragmentNamePattern.test(fragment.meta.name) || !validFragmentDescPattern.test(fragment.meta.name) || fragment.meta.name.length > 100 || (fragment.meta.description !== undefined && fragment.meta.description.length > 100)) {
            return false;
        }
        // TODO: Implement fragment version & author validation
        // TODO: Implement description validation (description is optional)
        else if (typeof fragment.meta !== "object" || typeof fragment.meta.name !== "string" || (fragment.meta.author !== undefined && typeof fragment.meta.author !== "string") || (fragment.meta.version !== undefined && typeof fragment.meta.version !== "string")) {
            return false;
        }

        return true;
    }

    /**
     * Scan a specific directory for candidate fragments
     * @param {string} directory The directory to scan
     * @param {boolean} [recursive=true] Whether to also scan subdirectories
     * @param {RegExp} pattern The pattern to test files with
     * @return {Promise<string[] | null>} A promise containing the matching files or null if the specified directory does not exist
     */
    public static async scan(directory: string, recursive: boolean = true, pattern: RegExp = Patterns.fragmentFileName): Promise<string[] | null> {
        return new Promise<string[] | null>(async (resolve) => {
            if (!fs.existsSync(directory)) {
                resolve(null);

                return;
            }

            const result: string[] = [];
            const scanQueue: string[] = [directory];

            for (const dir of scanQueue) {
                const files: string[] | null = await Util.getFiles(dir, true);

                if (files === null) {
                    Log.warn(`Failed to read files of the directory: ${dir}`);

                    continue;
                }

                for (const file of files) {
                    const isDir: boolean = fs.lstatSync(file).isDirectory();

                    if (recursive && isDir) {
                        scanQueue.push(file);
                    }
                    // Verify the filename
                    else if (!isDir && pattern.test(file)) {
                        result.push(file);
                    }
                }
            }

            resolve(result);
        });
    }

    /**
     * Load multiple packages
     * @param {string[]} items
     * @return {Promise<IPackage[] | null>}
     */
    public static async loadMultiple(items: string[]): Promise<IPackage[] | null> {
        if (items.length === 0) {
            Log.warn("Items array is empty");

            return null;
        }

        const result: IPackage[] = [];

        for (const item of items) {
            const packg: IPackage | null = await Loader.load(item);

            if (packg !== null) {
                result.push(packg);
            }
        }

        return result;
    }
}
