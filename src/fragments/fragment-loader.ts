import fs from "fs";
import {IFragment} from "./fragment";
import Log from "../core/log";
import Utils from "../core/utils";
import path from "path";
import {Command} from "..";

const validFragmentNamePattern: RegExp = /^(?:[a-z]{0,}[a-z0-9-_\S]+){2,50}$/i;
const validFragmentDescPattern: RegExp = /^(?:[a-z]{0,}[^\n\r\t\0]+){1,100}$/i;

export type IPackage = {
    readonly module: IFragment;
    readonly path: string;
}

export type ILivePackage<InstanceType extends IFragment> = {
    readonly instance: InstanceType;
    readonly path: string;
}

export default abstract class FragmentLoader {
    /**
     * @todo Make use of the 'isolate' parameter
     * @param {string} filePath The path to the fragment
     * @return {Promise<IFragment | null>}
     */
    public static async load(filePath: string): Promise<IPackage | null> {
        if (!fs.existsSync(filePath)) {
            Log.warn(`[FragmentLoader.load] Fragment path does not exist: ${filePath}`);

            return null;
        }

        try {
            let module: any = require(filePath);

            // TODO: Make use of function exports as "simple commands"?
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
            // TODO: Was debugging I guess?
            throw exception;

            Log.warn(`[FragmentLoader.load] There was an error while loading a fragment: ${exception}`);

            return null;
        }
    }

    /**
     * @todo Test and make sure it works
     * @param {string} file
     * @return {Promise<IPackage | null>}
     */
    public static async reload(file: string): Promise<IPackage | null> {
        delete require.cache[require.resolve(file)];

        return FragmentLoader.load(file);
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
        else if (!fragment.meta.name || !fragment.meta.description) {
            return false;
        }
        else if (!validFragmentNamePattern.test(fragment.meta.name) || !validFragmentDescPattern.test(fragment.meta.name) || fragment.meta.name.length > 100 || fragment.meta.description.length > 100) {
            return false;
        }
        // TODO: Implement fragment version & author validation
        else if (typeof fragment.meta !== "object" || typeof fragment.meta.name !== "string" || typeof fragment.meta.description !== "string" || (fragment.meta.author !== undefined && typeof fragment.meta.author !== "string") || (fragment.meta.version !== undefined && typeof fragment.meta.version !== "string")) {
            return false;
        }

        return true;
    }

    /**
     * Scan a specific directory for candidate fragments
     * @param {string} directory The directory to scan
     * @param {boolean} [recursive=true] Whether to also scan subdirectories
     * @return {Promise<string[] | null>}
     */
    public static async pickupCandidates(directory: string, recursive: boolean = true): Promise<string[] | null> {
        return new Promise<string[] | null>(async (resolve) => {
            if (!fs.existsSync(directory)) {
                resolve(null);

                return;
            }

            const result: string[] = [];
            const scanQueue: string[] = [directory];

            for (let dir: number = 0; dir < scanQueue.length; dir++) {
                const files: string[] | null = await Utils.getFiles(scanQueue[dir], true);

                if (files === null) {
                    Log.warn(`[FragmentLoader.pickupCandidates] Failed to read files of the directory: ${scanQueue[dir]}`);

                    continue;
                }

                for (let file: number = 0; file < files.length; file++) {
                    if (recursive && fs.lstatSync(files[file]).isDirectory()) {
                        scanQueue.push(files[file]);
                    }

                    if (!path.basename(files[file]).startsWith("@") && !path.basename(files[file]).startsWith(".") && files[file].endsWith(".js")) {
                        result.push(files[file]);
                    }
                }
            }

            resolve(result);

            return;
        });
    }

    /**
     * @param {string[]} candidates
     * @return {Promise<IPackage[] | null>}
     */
    public static async loadMultiple(candidates: string[]): Promise<IPackage[] | null> {
        if (candidates.length === 0) {
            Log.warn("[FragmentLoader.loadMultiple] Candidates array is empty");

            return null;
        }

        const result: IPackage[] = [];

        for (let i: number = 0; i < candidates.length; i++) {
            const packg: IPackage | null = await FragmentLoader.load(candidates[i]);

            if (packg !== null) {
                result.push(packg);
            }
        }

        return result;
    }
}
