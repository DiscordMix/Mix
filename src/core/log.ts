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
 * Callback to which logging actions will be
 * redirected to.
 */
export type LogPipe = (options: IComposeOptions) => void;

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
    * Callback to which logging actions will be
    * redirected to.
    */
    public static pipe: LogPipe = Log.compose;

    /**
     * Compose a message to be shown in the console.
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
     */
    public static playback(history: IComposeOptions[]): void {
        for (const options of history) {
            Log.pipe(options);
        }
    }

    /**
     * Display an information message in the console.
     * @param {*} message The message to display.
     */
    public static info(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            color: "cyan",
            message,
            params,
            level: LogLevel.Info,
            prefix: "info"
        };

        Log.pipe(options);
    }

    /**
     * Display a success message in the console.
     * @param {*} message The message to display.
     */
    public static success(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Success,
            color: "green",
            prefix: "sucs"
        };

        Log.pipe(options);
    }

    /**
     * Display a warning message in the console.
     * @param {*} message The message to display.
     */
    public static warn(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Warn,
            color: "yellow",
            prefix: "warn"
        };

        Log.pipe(options);
    }

    /**
     * Display an error message in the console. Program will not break.
     */
    public static error(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Error,
            color: "red",
            prefix: "dang"
        };

        Log.pipe(options);

        return new Error(message);
    }

    /**
     * Display a fatal error message in the console. Process will be stopped.
     */
    public static fatal(message: any, ...params: any[]): Error {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Fatal,
            color: "red",
            prefix: "fatal"
        };

        Log.pipe(options);
        process.exit(1);

        return new Error(message);
    }

    /**
     * Display a verbose message in the console.
     */
    public static verbose(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Verbose,
            color: "white",
            prefix: "verb"
        };

        Log.pipe(options);
    }

    /**
     * Display a debug message in the console. Log level must be set to debug.
     */
    public static debug(message: any, ...params: any[]): void {
        const options: IComposeOptions = {
            message,
            params,
            level: LogLevel.Debug,
            color: "magenta",
            prefix: "dbug"
        };

        Log.pipe(options);
    }

    /**
     * Create an error signaling lack of implementation.
     */
    public static get notImplemented(): Error {
        return new Error(BotMessages.NOT_IMPLEMENTED);
    }
}
