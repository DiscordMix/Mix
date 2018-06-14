import Log from "./log";
import Utils from "./utils";

const fs = require("fs");
const Typer = require("@raxor1234/typer/typer");

// TODO: All these interfaces probably shouldn't be
// read-only since it should be allowed to change them
// in code.
export interface SettingsGeneral {
    readonly token: string;
    readonly prefix: string;
}

export interface SettingsKeys {
    readonly dbl?: string;
    readonly bfd?: string;
}

export interface SettingsPaths {
    readonly commands?: string;
    readonly plugins?: string;
}

export interface SettingsOptions {
    readonly general: SettingsGeneral;
    readonly paths: SettingsPaths;
    readonly keys: SettingsKeys;
}

export default class Settings {
    general: SettingsGeneral;
    paths: SettingsPaths;
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
            commands: options.paths && options.paths.commands ? options.paths.commands : "./commands",
            plugins: options.paths && options.paths.plugins ? options.paths.plugins : "./plugins"
        };

        /**
         * @readonly
         * @type {SettingsKeys}
         */
        this.keys = options.keys;
    }

    /**
     * @todo Probably not needed anymore
     * Reload settings
     * @return {Promise<Settings>}
     */
    /* async reload(): Promise<Settings> {
        Log.verbose("[Settings.reload] Reloading");

        const jsonObj: any = await Utils.readJson(this.path);

        // TODO: Should be automatic
        // TODO: Should be validated using Schema | probably old comment
        /**
         * @type {Object}
         * @readonly
         */
        // this.general = jsonObj.general;

        /**
         * @type {Object}
         * @readonly
         */
        // this.keys = jsonObj.keys;

        // Log.success("[Settings.reload] Successfully reloaded settings");

        // TODO: May not be needed with typescript?
        // Validate settings after loading them
        // this.validate();

        // return this;
    //}

    /**
     * @todo Probably not needed anymore also
     * @todo Should be done async
     * Save the local settings into path
     * @return {Settings}
     */
    /* save(): Settings {
        fs.writeFileSync(this.path, JSON.stringify({
            general: this.general,
            keys: this.keys
        }, null, 4));

        return this;
    } */

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

        // TODO
        /* return new Settings({
            general: {
                token: fileSettings.general.token,
                prefix: fileSettings.general.prefix
            },

            paths: {
                // TODO: Even tho it has a default value here, when initiating it in code it
                // should also have a default value.
                commands: fileSettings.paths.commands
            },

            keys: {
                dbl: fileSettings.keys.dbl,
                bfd: fileSettings.keys.bfd
            }
        }); */
    }
}
