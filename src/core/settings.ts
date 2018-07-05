import Log from "./log";
import Utils from "./utils";

const fs = require("fs");
const Typer = require("@raxor1234/typer/typer");

// TODO: All these interfaces probably shouldn't be
// read-only since it should be allowed to change them
// in code.
export interface SettingsGeneral {
    readonly token: string;
    readonly prefixes: Array<string>;
}

export interface SettingsKeys {
    readonly dbl?: string;
    readonly bfd?: string;
}

export interface DefiniteSettingsPaths {
    readonly commands: string;
    readonly plugins: string;
    readonly emojis: string;
    readonly behaviours: string;
}

export interface SettingsPaths {
    readonly commands?: string;
    readonly plugins?: string;
    readonly emojis?: string;
    readonly behaviours?: string;
}

export interface SettingsOptions {
    readonly general: SettingsGeneral;
    readonly paths?: SettingsPaths;
    readonly keys?: SettingsKeys;
}

export default class Settings {
    general: SettingsGeneral;
    paths: DefiniteSettingsPaths;
    keys: SettingsKeys;

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
            commands: options.paths && options.paths.commands ? options.paths.commands : "./commands",
            plugins: options.paths && options.paths.plugins ? options.paths.plugins : "./plugins",
            emojis: options.paths && options.paths.emojis ? options.paths.emojis : "./emojis",
            behaviours: options.paths && options.paths.behaviours ? options.paths.behaviours : "./behaviours"
        };

        /**
         * @todo Hotfix default value, it should be OK like this, review anyway
         * @type {SettingsKeys}
         * @readonly
         */
        this.keys = options.keys || {};
    }

    /**
     * @todo Probably not needed anymore also x2
     * Validate the settings
     * @return {Settings}
     */
    validate(): Settings {
        if (!Typer.validate({
            token: "!string",
            prefix: "!string"
        }, this.general)) {
            Log.throw("[Settings.validate] Invalid settings provided");
        }

        return this;
    }

    /**
     * Load bot settings from a file
     * @param {string} path The file containing the settings
     * @return {Promise<Settings>}
     */
    static async fromFile(path: string): Promise<Settings> {
        if (!fs.existsSync(path)) {
            Log.throw("[Settings.fromFile] Could not load settings: File does not exist");
        }

        const fileSettings = await Utils.readJson(path);

        // TODO: Make sure pure objects work
        return new Settings(fileSettings);
    }
}
