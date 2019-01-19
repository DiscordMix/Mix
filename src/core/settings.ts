import fs from "fs";
import {DefaultSettingPaths} from "./constants";
import Log from "./log";
import BotMessages from "./messages";
import Util from "./util";

export interface ISettingsGeneral {
    /**
     * The token used to login to Discord
     */
    readonly token: string;

    /**
     * The prefixes that will trigger commands
     */
    readonly prefix: string[];
}

export interface ISettingsKeys {
    /**
     * The API key for DiscordBotList.org
     */
    readonly dbl?: string;

    /**
     * The API key for BotsForDiscord.com
     */
    readonly bfd?: string;
}

export interface ISettingsPaths {
    /**
     * The path to the commands directory
     */
    readonly commands: string;

    /**
     * The path to the plugins directory
     */
    readonly plugins: string;

    /**
     * The path to the services directory
     */
    readonly services: string;

    /**
     * The path to the languages directory
     */
    readonly languages: string;

    /**
     * The path to the tasks directory
     */
    readonly tasks: string;
}

export interface ISettingsOptions {
    readonly general: ISettingsGeneral;
    readonly paths?: Partial<ISettingsPaths>;
    readonly keys?: Partial<ISettingsKeys>;
}

export interface ISettings {
    readonly general: ISettingsGeneral;
    readonly paths: ISettingsPaths;
    readonly keys: ISettingsKeys;
}

export default class Settings implements ISettings {
    /**
     * Load bot settings from a file
     * @param {string} path The file containing the settings
     * @return {Promise<Settings>}
     */
    public static async fromFile(path: string): Promise<Settings> {
        if (!fs.existsSync(path)) {
            throw Log.fatal(BotMessages.CFG_FILE_NO_EXIST);
        }

        const fileSettings: ISettingsOptions = await Util.readJson(path);

        // TODO: Make sure pure objects work
        return new Settings(fileSettings);
    }

    public general: ISettingsGeneral;
    public paths: ISettingsPaths;
    public keys: ISettingsKeys;

    /**
     * @param {Partial<ISettingsOptions>} options
     */
    public constructor(options: Partial<ISettingsOptions>) {
        if (!options.general) {
            throw Log.error(BotMessages.CFG_EXPECT_GENERAL);
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
            ...DefaultSettingPaths,
            ...options.paths
        };

        /**
         * @todo Hotfix default value, it should be OK like this, review anyway
         * @type {ISettingsKeys}
         * @readonly
         */
        this.keys = options.keys || {};
    }
}
