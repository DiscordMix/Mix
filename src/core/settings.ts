import Log from "./log";
import Utils from "./utils";
import fs from "fs";

// TODO: All these interfaces probably shouldn't be
// read-only since it should be allowed to change them
// in code. OR maybe use the react-redux and vscode style
// of doing things, and make a copy of the current settings
// and upon disconnect save/rewrite them!
export type SettingsGeneral = {
    readonly token: string;
    readonly prefixes: string[];
}

export type SettingsKeys = {
    readonly dbl?: string;
    readonly bfd?: string;
}

export type DefiniteSettingsPaths = {
    readonly commands: string;
    readonly plugins: string;
    readonly emojis: string;
    readonly services: string;
    readonly languages?: string;
}

export type SettingsPaths = {
    readonly commands?: string;
    readonly plugins?: string;
    readonly emojis?: string;
    readonly services?: string;
    readonly languages?: string;
}

export type SettingsOptions = {
    readonly general: SettingsGeneral;
    readonly paths?: SettingsPaths;
    readonly keys?: SettingsKeys;
}

export default class Settings {
    public general: SettingsGeneral;
    public paths: DefiniteSettingsPaths;
    public keys: SettingsKeys;

    /**
     * @param {SettingsOptions} options
     */
    constructor(options: SettingsOptions) {
        /**
         * @type {SettingsGeneral}
         * @readonly
         */
        this.general = options.general;

        /**
         * @type {SettingsPaths}
         * @readonly
         */
        this.paths = {
            // TODO: Find a way to simplify this process
            commands: options.paths && options.paths.commands ? options.paths.commands : "./commandStore",
            plugins: options.paths && options.paths.plugins ? options.paths.plugins : "./plugins",
            emojis: options.paths && options.paths.emojis ? options.paths.emojis : "./emojis",
            services: options.paths && options.paths.services ? options.paths.services : "./services",
            languages: options.paths && options.paths.languages ? options.paths.languages : undefined
        };

        /**
         * @todo Hotfix default value, it should be OK like this, review anyway
         * @type {SettingsKeys}
         * @readonly
         */
        this.keys = options.keys || {};
    }

    /**
     * Load bot settings from a file
     * @param {string} path The file containing the settings
     * @return {Promise<Settings>}
     */
    public static async fromFile(path: string): Promise<Settings> {
        if (!fs.existsSync(path)) {
            Log.throw("[Settings.fromFile] Could not load settings: File does not exist");
        }

        const fileSettings: any = await Utils.readJson(path);

        // TODO: Make sure pure objects work
        return new Settings(fileSettings);
    }
}
