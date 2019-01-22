import fs from "fs";
import {IDiscordSettings} from "../universal/discord/discord-settings";
import Util from "./util";
import BotMessages from "./messages";
import Log from "../logging/log";

export interface ISettingsPaths {
    /**
     * The path to the languages directory.
     */
    readonly languages: string;
}

export interface ISettings {
    readonly paths: ISettingsPaths;
}

export default class Settings {
    /**
     * Load bot settings from a file
     * @param {string} path The file containing the settings
     * @return {Promise<Settings>}
     */
    public static async fromFile(path: string): Promise<Settings> {
        if (!fs.existsSync(path)) {
            throw Log.fatal(BotMessages.CFG_FILE_NO_EXIST);
        }

        return Util.readJson<IDiscordSettings>(path);
    }
}
