import fs from "fs";
import colors from "colors";

export enum LogLevel {
    None = -1,
    Fatal,
    Error,
    Warn,
    Info,
    Success,
    Verbose,
    Debug
}

export type IComposeOptions = {
    readonly message: any;
    readonly params: any[];
    readonly type: LogLevel;
    readonly color?: string;
    readonly prefix?: string;
}

export default class Log {
    public static hiddenItems: boolean = false;
    public static level: LogLevel = LogLevel.Success;

    /**
     * @param {IComposeOptions} options
     * @return {Promise<void>}
     */
    public static async compose(options: IComposeOptions): Promise<void> {
        if (Log.level === LogLevel.None) {
            return;
        }

        const finalColor: string = options.color || "white";

        // TODO:
        const finalPrefix: string | null = options.prefix ? options.prefix : null;

        let message: any = options.message;

        return new Promise<void>((resolve) => {
            // TODO: Make sure check is working as intended, seems a bit suspicious
            if (Log.level < options.type) {
                if (Log.hiddenItems) {
                    console.log(colors.gray("+ 1 Hidden Item"));
                }

                resolve();

                return;
            }

            const date: string = new Date().toISOString()
                .replace(/T/, " ")
                .replace(/\..+/, "");

            // TODO: Make this next line work on the vps
            // process.stdout.write(`\x1B[2D[${date}] ${colors[color](message)}\n> `);
            if (typeof message === "string") {
                console.log(`[${date}] ${(colors as any)[finalColor](message)}`, ...options.params);
            }
            else {
                console.log(`[${date}] `, message, ...options.params);
            }

            // TODO
            /* if (finalPrefix !== null) {
                finalMessages = `<${finalPrefix.toUpperCase()}> ${finalMessages}`;
            } */

            resolve();

            fs.writeFile("bot.log", `[${date}] ${message} ${options.params.map((param: any) => param.toString()).join(" ")}\n`, {
                flag: "a"
            }, (error: Error) => {
                if (error) {
                    throw error;
                }
            });
        });
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static info(message: any, ...params: any[]): Promise<void> {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Info,
            color: "cyan",
            prefix: "info"
        };

        return Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static success(message: any, ...params: any[]): Promise<void> {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Success,
            color: "green",
            prefix: "sucs"
        };

        return Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static warn(message: any, ...params: any[]): Promise<void> {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Warn,
            color: "yellow",
            prefix: "warn"
        };

        return Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static error(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Error,
            color: "red",
            prefix: "dang"
        };

        Log.compose(options);

        return new Error(message);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static throw(message: any, ...params: any[]): Promise<void> {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Fatal,
            color: "red",
            prefix: "fata"
        };

        const result: any = Log.compose(options);

        process.exit(1);

        return result;
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static verbose(message: any, ...params: any[]): Promise<void> {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Verbose,
            color: "white",
            prefix: "verb"
        };

        return Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     * @return {Promise<void>}
     */
    public static debug(message: any, ...params: any[]): Promise<void> {
        const options: IComposeOptions = {
            message: message,
            params: params,
            type: LogLevel.Debug,
            color: "magenta",
            prefix: "dbug"
        };

        return Log.compose(options);
    }
}
