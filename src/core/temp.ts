import Log from "./log";
import Utils from "./utils";

const fs = require("fs");
const path = require("path");

export default class Temp {
    readonly id: string;
    readonly resolvedPath: string;

    /**
     * @todo Temp base path should be optionally determined from settings
     * @param {string} id
     */
    constructor(id: string) {
        this.id = id;
        this.resolvedPath = Temp.resolvePath(this.id);
    }

    /**
     * Create the temp folder for the bot
     * @return {Promise<*>}
     */
    async create(): Promise<any> {
        return new Promise((resolve) => {
            if (!fs.existsSync(this.resolvedPath)) {
                fs.mkdir(this.resolvedPath, (error: Error) => {
                    if (error) {
                        Log.error(`There was an error creating the temp folder for the bot: ${this.id} (${error.message})`);
                    }

                    resolve();
                });
            }
            else {
                Log.warn(`[Temp.create] Temp folder already exists for the bot: ${this.id}. This may be due to an improper bot shutdown.`);
            }
        });
    }

    /**
     * Write data in JSON into a file in the temp folder for the bot
     * @param {*} data
     * @param {string} file The file in which to store the data
     * @return {Promise<boolean>}
     */
    store(data: any, file: string): Promise<boolean> {
        return Utils.writeJson(path.resolve(path.join(this.resolvedPath, file)), data);
    }

    /**
     * @param {string} id
     * @return {string}
     */
    static resolvePath(id: string): string {
        return path.join("tmp", `u${id}`);
    }
}
