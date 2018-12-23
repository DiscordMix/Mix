import Log from "./log";
import Utils from "./utils";
import fs from "fs";
import BotMessages from "./messages";

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
    readonly services: string;
    readonly languages: string;
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
            throw new Error(BotMessages.CFG_EXPECT_GENERAL);
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
            services: options.paths && options.paths.services ? options.paths.services : "./services",
            languages: options.paths && options.paths.languages ? options.paths.languages : "./languages",
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
            Log.throw(BotMessages.CFG_FILE_NO_EXIST);
        }

        const fileSettings: ISettingsOptions = await Utils.readJson(path);

        // TODO: Make sure pure objects work
        return new Settings(fileSettings);
    }
}
