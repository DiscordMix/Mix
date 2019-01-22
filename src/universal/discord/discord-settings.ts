import {ISettings, ISettingsPaths} from "../../core/settings";

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
    readonly dbl: string;

    /**
     * The API key for BotsForDiscord.com.
     */
    readonly bfd: string;
}

export interface IDiscordSettingsOpts {
    readonly general: IDiscordSettingsGeneral;
    readonly paths?: Partial<IDiscordSettingsPaths>;
    readonly keys?: Partial<IDiscordSettingsKeys>;
}

export interface IDiscordSettings extends ISettings {
    readonly general: IDiscordSettingsGeneral;
    readonly paths: IDiscordSettingsPaths;
    readonly keys?: IDiscordSettingsKeys;
}

export interface IDiscordSettingsPaths extends ISettingsPaths {
    /**
     * The path to the commands directory.
     */
    readonly commands: string;

    /**
     * The path to the services directory.
     */
    readonly services: string;

    /**
     * The path to the tasks directory.
     */
    readonly tasks: string;
}
