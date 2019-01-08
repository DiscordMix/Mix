import Log from "./log";
import Utils from "./utils";
import {Snowflake} from "discord.js";
import fs from "fs";
import path from "path";
import {default as main} from "require-main-filename";
import {FileSystemOperations} from "@atlas/automata";
import {PromiseOr} from "..";

export interface ITemp {
    setup(id: Snowflake): this;
    create(): PromiseOr<this>;
    reset(): PromiseOr<this>;
    store(data: any, file: string): PromiseOr<this>;
}

/**
 * Allows management of temporary data storage
 */
export default class Temp implements ITemp {
    protected id?: string;
    protected resolvedPath?: string;

    /**
     * @todo Temp base path should be optionally determined from settings
     */
    public constructor() {
        //
    }

    /**
     * @param {Snowflake} id
     * @return {this}
     */
    public setup(id: Snowflake): this {
        /**
         * @type {string | undefined}
         * @protected
         */
        this.id = id;

        /**
         * @type {string | undefined}
         * @protected
         */
        this.resolvedPath = Temp.resolvePath(this.id);

        return this;
    }

    /**
     * Create the temp folder for the bot
     * @return {Promise<this>}
     */
    public async create(): Promise<this> {
        return new Promise<this>((resolve) => {
            if (!this.resolvedPath) {
                throw new Error("[Temp.create] Trying to create when the resolved path is undefined");
            }

            if (!fs.existsSync(this.resolvedPath)) {
                if (!fs.existsSync(Temp.resolveRootPath())) {
                    fs.mkdirSync(Temp.resolveRootPath());
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
     * @return {Promise<this>}
     */
    public async reset(): Promise<this> {
        if (!this.resolvedPath) {
            return this;
        }
        else if (fs.existsSync(this.resolvedPath)) {
            FileSystemOperations.forceRemoveSync(this.resolvedPath);
        }

        return this;
    }

    /**
     * Write data in JSON into a file in the temp folder for the bot
     * @param {*} data
     * @param {string} file The file in which to store the data
     * @return {Promise<void>}
     */
    public async store(data: any, file: string): Promise<this> {
        if (!this.resolvedPath) {
            throw new Error("[Temp.store] Trying to store when the resolved path is undefined");
        }

        await Utils.writeJson(path.resolve(path.join(this.resolvedPath, file)), data);

        return this;
    }

    /**
     * @param {string} id
     * @return {string}
     */
    public static resolvePath(id: string): string {
        return path.join(Temp.resolveRootPath(), `u${id}`);
    }

    /**
     * @return {string}
     */
    public static resolveRootPath(): string {
        return path.join(path.dirname(main()), "tmp");
    }
}
