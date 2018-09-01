import fs from "fs";
import Fragment from "./fragment";
import Log from "../core/log";
import Utils from "../core/utils";
import path from "path";

export default abstract class FragmentLoader {
    /**
     * @todo Make use of the 'isolate' parameter
     * @param {string} file The path to the fragment
     * @param {boolean} [isolate=false] Whether to isolate the fragment environment
     * @return {Promise<Fragment | null>}
     */
    public static async load(file: string, isolate: boolean = false): Promise<Fragment | null> {
        if (!fs.existsSync(file)) {
            Log.warn(`[FragmentLoader.load] Fragment path does not exist: ${file}`);

            return null;
        }

        try {
            let module: any = require(file);

            // Support for ES6 default module exports
            if (module.default) {
                module = module.default;
            }

            return module;
        }
        catch (exception) {
            Log.warn(`[FragmentLoader.load] There was an error while loading a fragment: ${exception}`);

            return null;
        }
    }

    /**
     * Scan a specific directory for candidate fragments
     * @param {string} directory The directory to scan
     * @param {boolean} [recursive=true] Whether to also scan subdirectories
     * @return {Promise<Array<string> | null>}
     */
    public static async pickupCandidates(directory: string, recursive: boolean = true): Promise<Array<string> | null> {
        return new Promise<Array<string> | null>(async (resolve) => {
            if (!fs.existsSync(directory)) {
                resolve(null);

                return;
            }

            const result: Array<string> = [];
            const scanQueue: Array<string> = [directory];

            for (let dir: number = 0; dir < scanQueue.length; dir++) {
                const files = await Utils.getFiles(scanQueue[dir], true);

                if (!files) {
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
     * @param {Array<string>} candidates
     * @param {boolean} isolate
     * @return {Promise<Array<Fragment> | null>}
     */
    public static async loadMultiple(candidates: Array<string>, isolate: boolean = false): Promise<Array<Fragment> | null> {
        if (candidates.length === 0) {
            Log.warn("[FragmentLoader.loadMultiple] Candidates array is empty");

            return null;
        }

        const result: Array<Fragment> = [];

        for (let i: number = 0; i < candidates.length; i++) {
            const fragment: Fragment | null = await FragmentLoader.load(candidates[i], isolate);

            if (fragment !== null) {
                result.push(fragment);
            }
        }

        return result;
    }
}
