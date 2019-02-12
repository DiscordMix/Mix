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
    readonly level: LogLevel;
    readonly color?: string;
    readonly prefix?: string;
}

/**
 * Utility class for logging output into the console.
 */
export default abstract class Log {
    /**
     * Whether hidden log items should be shown.
     */
    public static hiddenItems: boolean = false;

    /**
     * The level to limit logging.
     */
    public static level: LogLevel = LogLevel.Success;

    /**
     * The output file to which logs will be written.
     */
    public static file: string = "bot.log";

    /**
     * Whether to log messages.
     */
    public static write: boolean = true;

    /**
     * Contains the previous sent messages or empty if not recording messages.
     */
    public static history: IComposeOptions[] = [];

    /**
     * Whether to record messages.
     */
    public static record: boolean = true;

    /**
     * Compose a message to be shown in the console.
     * @param {IComposeOptions} options
     */
    public static compose(options: IComposeOptions): void {
        if (Log.record) {
            Log.history.push(options);
        }

        if (Log.level === LogLevel.None) {
            return;
        }

        const color: string = options.color || "white";

        let message: any = options.message;

        // TODO: Make sure check is working as intended, seems a bit suspicious.
        if (Log.level < options.level) {
            if (Log.hiddenItems) {
                console.log(colors.gray("+ 1 Hidden Item"));
            }

            return;
        }

        // Special background for fatal.
        if (typeof message === "string" && options.level === LogLevel.Fatal) {
            message = colors.bgRed.white(message);
        }

        const timePrefix: string = colors.gray(new Date().toLocaleTimeString());

        if (typeof message === "string") {
            console.log(`${timePrefix} ${(colors as any)[color](message)}`, ...options.params);
        }
        else {
            console.log(timePrefix, message, ...options.params);
        }

        if (Log.write) {
            fs.writeFile(Log.file, `{${timePrefix}} ${message} ${options.params.map((param: any) => param.toString()).join(" ")}\n`, {
                flag: "a"
            }, (error: Error) => {
                if (error) {
                    throw error;
                }
            });
        }
    }

    /**
     * Attempt to log a set of recorded messages to the console.
     * @param {IComposeOptions[]} history
     */
    public static playback(history: IComposeOptions[]): void {
        for (const options of history) {
            this.compose(options);
        }
    }

    /**
     * Display an information message in the console.
     * @param {*} message The message to display.
     * @param {Array<*>} params
     */
    public static info(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            color: "cyan",
            message,
            params,
            level: LogLevel.Info,
            prefix: "info"
        };

        Log.compose(options);
    }

    /**
     * Display a success message in the console.
     * @param {*} message The message to display.
     * @param {Array<*>} params
     */
    public static success(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Success,
            color: "green",
            prefix: "sucs"
        };

        Log.compose(options);
    }

    /**
     * Display a warning message in the console.
     * @param {*} message The message to display.
     * @param {Array<*>} params
     */
    public static warn(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Warn,
            color: "yellow",
            prefix: "warn"
        };

        Log.compose(options);
    }

    /**
     * Display an error message in the console. Program will not break.
     * @param {*} message
     * @param {Array<*>} params
     */
    public static error(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Error,
            color: "red",
            prefix: "dang"
        };

        Log.compose(options);

        return new Error(message);
    }

    /**
     * Display a fatal error message in the console. Process will be stopped.
     * @param {*} message
     * @param {Array<*>} params
     */
    public static fatal(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Fatal,
            color: "red",
            prefix: "fatal"
        };

        Log.compose(options);
        process.exit(1);

        return new Error(message);
    }

    /**
     * Display a verbose message in the console.
     * @param {*} message
     * @param {Array<*>} params
     */
    public static verbose(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Verbose,
            color: "white",
            prefix: "verb"
        };

        Log.compose(options);
    }

    /**
     * Display a debug message in the console. Log level must be set to debug.
     * @param {*} message
     * @param {Array<*>} params
     */
    public static debug(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Debug,
            color: "magenta",
            prefix: "dbug"
        };

        Log.compose(options);
    }

    /**
     * Create an error signaling lack of implementation.
     */
    public static get notImplemented(): Error {
        return new Error(BotMessages.NOT_IMPLEMENTED);
    }
}
