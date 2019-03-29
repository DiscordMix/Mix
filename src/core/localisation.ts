import fs from "fs";
import path from "path";
import BotMessages from "./messages";
import Util from "./util";
import {PromiseOr} from "@atlas/xlib";
import Log from "./log";
import JsonUtil from "./json";

export type LanguageSource = Map<string, any>;

export interface ILanguage {
    readonly directory?: string;

    getLanguages(): ReadonlyMap<string, LanguageSource>;
    setDefault(name: string): boolean;
    get(key: string): string | null;
    load(name: string): PromiseOr<this>;
}

export default class Localisation implements ILanguage {
    public readonly directory?: string;

    protected readonly languages: Map<string, LanguageSource>;

    protected default?: LanguageSource;

    public constructor(directory: string) {
        this.directory = directory;
        this.languages = new Map();
    }

    public getLanguages(): ReadonlyMap<string, LanguageSource> {
        return this.languages as ReadonlyMap<string, any>;
    }

    public setDefault(name: string): boolean {
        if (typeof name !== "string" || Util.isEmpty(name)) {
            return false;
        }
        else if (this.languages.size === 0 || !this.languages.has(name)) {
            return false;
        }

        this.default = this.languages.get(name);

        return true;
    }

    public get(key: string): string | null {
        if (typeof key !== "string" || Util.isEmpty(key)) {
            return null;
        }
        else if (!this.default) {
            throw Log.error(BotMessages.LANG_NO_DEFAULT);
        }

        return this.default[key] || null;
    }

    public async load(name: string): Promise<this> {
        if (!this.directory) {
            throw Log.error(BotMessages.LANG_NO_BASE_DIR);
        }
        else if (!fs.existsSync(this.directory)) {
            throw Log.error(BotMessages.LANG_BASE_DIR_NO_EXIST);
        }

        const filePath: string = path.resolve(path.join(this.directory, `${name}.json`));

        if (!fs.existsSync(filePath)) {
            throw Log.error(`Language file does not exist: ${filePath}`);
        }

        const data: LanguageSource = await JsonUtil.read(filePath);

        if (typeof data !== "object" || Object.keys(data).length === 0) {
            throw Log.error(`Language file is either not an object or empty: ${name}`);
        }

        this.languages.set(name, data);

        return this;
    }
}
