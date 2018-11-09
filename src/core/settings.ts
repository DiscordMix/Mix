import Log from "./log";
import Utils from "./utils";
import fs from "fs";

// TODO: All these interfaces probably shouldn't be
// read-only since it should be allowed to change them
// in code. OR maybe use the react-redux and vscode style
// of doing things, and make a copy of the current settings
// and upon disconnect save/rewrite them!
export type ISettingsGeneral = {
    readonly token: string;
    readonly prefixes: string[];
}

export type ISettingsKeys = {
    readonly dbl?: string;
    readonly bfd?: string;
}

export type ISettingsPaths = {
    readonly commands: string;
    readonly plugins: string;
    readonly emojis: string;
    readonly services: string;
    readonly languages?: string;
    readonly tasks: string;
}

export type ISettingsOptions = {
    readonly general: ISettingsGeneral;
    readonly paths?: Partial<ISettingsPaths>;
    readonly keys?: Partial<ISettingsKeys>;
}

export default class Settings {
    public general: ISettingsGeneral;
    public paths: ISettingsPaths;
    public keys: ISettingsKeys;

    /**
     * @param {Partial<ISettingsOptions>} options
     */
    public constructor(options: Partial<ISettingsOptions>) {
        if (!options.general) {
            throw new Error("[Settings] Expecting general settings");
        }

        /**
         * @type {ISettingsGeneral}
         * @readonly
         */
        this.general = options.general;

        /**
         * @type {ISettingsPaths}
         * @readonly
         */
        this.paths = {
            // TODO: Find a way to simplify this process
            commands: options.paths && options.paths.commands ? options.paths.commands : "./commandStore",
            plugins: options.paths && options.paths.plugins ? options.paths.plugins : "./plugins",
            emojis: options.paths && options.paths.emojis ? options.paths.emojis : "./emojis",
            services: options.paths && options.paths.services ? options.paths.services : "./services",
            languages: options.paths && options.paths.languages ? options.paths.languages : undefined,
            tasks: options.paths && options.paths.tasks ? options.paths.tasks : "./tasks"
        };

        /**
         * @todo Hotfix default value, it should be OK like this, review anyway
         * @type {ISettingsKeys}
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
