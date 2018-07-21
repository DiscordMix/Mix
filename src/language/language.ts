import Utils from "../core/utils";
import path from "path";
import fs from "fs";

const main = require("require-main-filename");

export type LanguageSource = any;

export default class Language {
    private languages: Map<string, LanguageSource>;
    private default?: LanguageSource;

    public readonly directory?: string;

    constructor(directory?: string) {
        this.directory = directory;
        this.languages = new Map<string, any>();
    }

    public getLanguages(): ReadonlyMap<string, LanguageSource> {
        return this.languages as ReadonlyMap<string, any>;
    }

    public setDefault(name: string): void {
        if (this.languages.size === 0) {
            throw new Error("[Language.setDefault] No language sources have been loaded");
        }
        else if (!this.languages.has(name)) {
            throw new Error(`[Language.setDefault] Language source is not loaded: ${name}`);
        }

        this.default = this.languages.get(name);
    }

    public get(key: string): any {
        if (!this.default) {
            throw new Error("[Language.get] No language source has been set as default");
        }

        return this.default[key];
    }

    public async load(name: string): Promise<this> {
        if (!this.directory) {
            throw new Error("[Language.load] No base directory has been specified");
        }

        const filePath: string = path.resolve(path.join(main(), this.directory, `${name}.json`));

        if (!fs.existsSync(filePath)) {
            throw new Error(`[Language.load] Language file does not exist: ${filePath}`);
        }

        const data: LanguageSource = await Utils.readJson(filePath);

        if (!(data instanceof Object) || Object.keys(data).length === 0) {
            throw new Error(`[Language.load] Language file is either not an object or empty: ${name}`);
        }

        this.languages.set(name, data);

        return this;
    }
}