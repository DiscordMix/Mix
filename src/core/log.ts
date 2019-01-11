import colors from "colors";
import fs from "fs";
import BotMessages from "./messages";

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

export interface IComposeOptions {
    readonly message: any;
    readonly params: any[];
    readonly type: LogLevel;
    readonly color?: string;
    readonly prefix?: string;
}

export default abstract class Log {
    public static hiddenItems: boolean = false;
    public static level: LogLevel = LogLevel.Success;
    public static file: string = "bot.log";
    public static write: boolean = true;

    /**
     * @param {IComposeOptions} options
     */
    public static compose(options: IComposeOptions): void {
        if (Log.level === LogLevel.None) {
            return;
        }

        const color: string = options.color || "white";

        const message: any = options.message;

        // TODO: Make sure check is working as intended, seems a bit suspicious
        if (Log.level < options.type) {
            if (Log.hiddenItems) {
                console.log(colors.gray("+ 1 Hidden Item"));
            }

            return;
        }

        const date: string = new Date().toISOString()
            .replace(/T/, " ")
            .replace(/\..+/, "");

        if (typeof message === "string") {
            console.log(`{${date}} ${(colors as any)[color](message)}`, ...options.params);
        }
        else {
            console.log(`{${date}} `, message, ...options.params);
        }

        if (Log.write) {
            fs.writeFile(Log.file, `{${date}} ${message} ${options.params.map((param: any) => param.toString()).join(" ")}\n`, {
                flag: "a"
            }, (error: Error) => {
                if (error) {
                    throw error;
                }
            });
        }
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     */
    public static info(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            type: LogLevel.Info,
            color: "cyan",
            prefix: "info"
        };

        Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     */
    public static success(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            type: LogLevel.Success,
            color: "green",
            prefix: "sucs"
        };

        Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     */
    public static warn(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            type: LogLevel.Warn,
            color: "yellow",
            prefix: "warn"
        };

        Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     */
    public static error(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message,
            params,
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
     */
    public static fatal(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message,
            params,
            type: LogLevel.Fatal,
            color: "red",
            prefix: "fatal"
        };

        Log.compose(options);
        process.exit(1);

        return new Error(message);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     */
    public static verbose(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            type: LogLevel.Verbose,
            color: "white",
            prefix: "verb"
        };

        Log.compose(options);
    }

    /**
     * @param {*} message
     * @param {Array<*>} params
     */
    public static debug(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            type: LogLevel.Debug,
            color: "magenta",
            prefix: "dbug"
        };

        Log.compose(options);
    }

    public static get notImplemented(): Error {
        return new Error(BotMessages.NOT_IMPLEMENTED);
    }
}
