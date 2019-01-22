export interface ISettingsPaths {
    /**
     * The path to the commands directory.
     */
    readonly commands: string;

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

export interface ISettings {
    readonly paths: ISettingsPaths;
}
