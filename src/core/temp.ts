import Log from "./log";
import Utils from "./utils";
import {Snowflake} from "discord.js";
import fs from "fs";
import path from "path";

const rimraf = require("rimraf");
const main = require("require-main-filename");

export default class Temp {
    private id?: string;
    private resolvedPath?: string;

    /**
     * @todo Temp base path should be optionally determined from settings
     */
    constructor() {
        //
    }

    /**
     * @param {Snowflake} id
     * @return {this}
     */
    setup(id: Snowflake): this {
        /**
         * @type {string | undefined}
         * @private
         */
        this.id = id;

        /**
         * @type {string | undefined}
         * @private
         */
        this.resolvedPath = Temp.resolvePath(this.id);

        return this;
    }

    /**
     * Create the temp folder for the bot
     * @return {Promise<this>}
     */
    async create(): Promise<this> {
        return new Promise<this>((resolve) => {
            if (!this.resolvedPath) {
                throw new Error("[Temp.create] Trying to create when the resolved path is undefined");
            }

            if (!fs.existsSync(this.resolvedPath)) {
                if (!fs.existsSync("tmp")) {
                    fs.mkdirSync("tmp");
                }

                fs.mkdir(this.resolvedPath, (error: Error) => {
                    if (error) {
                        Log.error(`There was an error creating the temp folder for the bot: ${this.id} (${error.message})`);
                    }

                    resolve(this);
                });
            }
            else {
                Log.warn(`[Temp.create] Temp folder already exists for the bot: ${this.id}. This may be due to an improper bot shutdown.`);

                resolve(this);
            }
        });
    }

    /**
     * @todo: Return type
     * @return {Promise<*>}
     */
    async reset(): Promise<this> {
        return new Promise<this>((resolve) => {
            if (!this.resolvedPath) {
                throw new Error("[Temp.reset] Trying to reset when the resolved path is undefined");
            }

            if (fs.existsSync(this.resolvedPath)) {
                rimraf(this.resolvedPath, (error: Error) => {
                    if (error) {
                        Log.error(`[Temp.reset] There was an error while resetting the temp folder: ${error.message}`)
                    }

                    resolve(this);
                });
            }
            else {
                resolve(this);
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
        if (!this.resolvedPath) {
            throw new Error("[Temp.store] Trying to store when the resolved path is undefined");
        }

        return Utils.writeJson(path.resolve(path.join(this.resolvedPath, file)), data);
    }

    /**
     * @param {string} id
     * @return {string}
     */
    static resolvePath(id: string): string {
        return path.join(path.dirname(main()), "tmp", `u${id}`);
    }
}
