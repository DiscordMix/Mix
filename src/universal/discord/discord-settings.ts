import fs from "fs";
import {DefaultSettingPaths} from "../../core/constants";
import Log from "../../logging/log";
import BotMessages from "../../core/messages";
import Util from "../../core/util";

export interface IDiscordSettingsGeneral {
    /**
     * The token required to login to Discord.
     */
    readonly token: string;

    /**
     * The prefixes that will trigger commands.
     */
    readonly prefix: string[];
}

export interface IDiscordSettingsKeys {
    /**
     * The API key for DiscordBotList.org.
     */
    readonly dbl?: string;

    /**
     * The API key for BotsForDiscord.com.
     */
    readonly bfd?: string;
}

export interface IDiscordSettingsPaths {
    /**
     * The path to the commands directory.
     */
    readonly commands: string;

    /**
     * The path to the plugins directory.
     */
    readonly plugins: string;

    /**
     * The path to the services directory.
     */
    readonly services: string;

    /**
     * The path to the languages directory.
     */
    readonly languages: string;

    /**
     * The path to the tasks directory.
     */
    readonly tasks: string;
}

export interface IDiscordSettingsOpts {
    readonly general: IDiscordSettingsGeneral;
    readonly paths?: Partial<IDiscordSettingsPaths>;
    readonly keys?: Partial<IDiscordSettingsKeys>;
}

export interface IDiscordSettings {
    readonly general: IDiscordSettingsGeneral;
    readonly paths: IDiscordSettingsPaths;
    readonly keys: IDiscordSettingsKeys;
}

export default class DiscordSettings implements IDiscordSettings {
    /**
     * Load bot settings from a file
     * @param {string} path The file containing the settings
     * @return {Promise<DiscordSettings>}
     */
    public static async fromFile(path: string): Promise<DiscordSettings> {
        if (!fs.existsSync(path)) {
            throw Log.fatal(BotMessages.CFG_FILE_NO_EXIST);
        }

        const fileSettings: IDiscordSettingsOpts = await Util.readJson(path);

        // TODO: Make sure pure objects work
        return new DiscordSettings(fileSettings);
    }

    public general: IDiscordSettingsGeneral;
    public paths: IDiscordSettingsPaths;
    public keys: IDiscordSettingsKeys;

    /**
     * @param {Partial<IDiscordSettingsOpts>} options
     */
    public constructor(options: Partial<IDiscordSettingsOpts>) {
        if (!options.general) {
            throw Log.error(BotMessages.CFG_EXPECT_GENERAL);
        }

        /**
         * @type {IDiscordSettingsGeneral}
         * @readonly
         */
        this.general = options.general;

        /**
         * @type {IDiscordSettingsPaths}
         * @readonly
         */
        this.paths = {
            ...DefaultSettingPaths,
            ...options.paths
        };

        /**
         * @todo Hotfix default value, it should be OK like this, review anyway
         * @type {IDiscordSettingsKeys}
         * @readonly
         */
        this.keys = options.keys || {};
    }
}
