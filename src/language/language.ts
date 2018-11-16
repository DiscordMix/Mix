import Utils from "../core/utils";
import path from "path";
import fs from "fs";

export type ILanguageSource = Map<string, any>;

export default class Language {
    private readonly languages: Map<string, ILanguageSource>;

    private default?: ILanguageSource;

    public readonly directory?: string;

    /**
     * @param {string} directory
     */
    public constructor(directory: string) {
        /**
         * @type {ILanguageSource | undefined}
         * @private
         */
        this.directory = directory;

        /**
         * @type {Map<string, ILanguageSource>}
         * @private
         * @readonly
         */
        this.languages = new Map();
    }

    /**
     * @return {ReadonlyMap<string, ILanguageSource>}
     */
    public getLanguages(): ReadonlyMap<string, ILanguageSource> {
        return this.languages as ReadonlyMap<string, any>;
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    public setDefault(name: string): boolean {
        if (typeof name !== "string" || Utils.isEmpty(name)) {
            return false;
        }
        else if (this.languages.size === 0 || !this.languages.has(name)) {
            return false;
        }

        this.default = this.languages.get(name);

        return true;
    }

    /**
     * @param {string} key
     * @return {string | null}
     */
    public get(key: string): string | null {
        if (typeof key !== "string" || Utils.isEmpty(key)) {
            return null;
        }
        else if (!this.default) {
            throw new Error("[Language.get] No language source has been set as default");
        }

        return this.default[key] || null;
    }

    /**
     * @param {string} name
     * @return {Promise<this>}
     */
    public async load(name: string): Promise<this> {
        if (!this.directory) {
            throw new Error("[Language.load] No base directory has been specified");
        }
        else if (!fs.existsSync(this.directory)) {
            throw new Error("[Language.load] Base directory no longer exists");
        }

        const filePath: string = path.resolve(path.join(this.directory, `${name}.json`));

        if (!fs.existsSync(filePath)) {
            throw new Error(`[Language.load] Language file does not exist: ${filePath}`);
        }

        const data: ILanguageSource = await Utils.readJson(filePath);

        if (typeof data != "object" || Object.keys(data).length === 0) {
            throw new Error(`[Language.load] Language file is either not an object or empty: ${name}`);
        }

        this.languages.set(name, data);

        return this;
    }
}
