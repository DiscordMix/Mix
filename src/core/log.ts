const colors = require("colors");
const fs = require("fs");

export enum LogLevel {
    Fatal,
    Error,
    Warn,
    Info,
    Success,
    Verbose,
    Debug
}

export interface ComposeOptions {
    readonly message: string;
    readonly type: LogLevel;
    readonly color?: string;
    readonly prefix?: string;
}

export default class Log {
    static level: LogLevel = LogLevel.Success;

    /**
     * @param {ComposeOptions} options
     * @return {Promise<void>}
     */
    static async compose(options: ComposeOptions): Promise<any> {
        const finalColor = options.color ? options.color : "white";
        const finalPrefix = options.prefix ? options.prefix : "";

        let finalMessage = options.message;

        return new Promise((resolve) => {
            // TODO: Make sure check is working as intended, seems a bit suspicious
            if (Log.level < options.type) {
                resolve();

                return;
            }

            const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

            // TODO: Make this next line work on the vps
            // process.stdout.write(`\x1B[2D[${date}] ${colors[color](message)}\n> `);
            console.log(`[${date}] ${colors[finalColor](finalMessage)}`);

            if (finalPrefix !== null) {
                finalMessage = `<${finalPrefix.toUpperCase()}> ${finalMessage}`;
            }

            fs.writeFile("bot.log", `[${date}] ${finalMessage}\n`, {
                flag: "a"
            }, (error: any) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * @param {string} message
     */
    static info(message: string): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Info,
            color: "cyan",
            prefix: "info"
        };

        return Log.compose(options);
    }

    /**
     * @param {string} message
     */
    static success(message: string): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Success,
            color: "green",
            prefix: "sucs"
        };

        return Log.compose(options);
    }

    /**
     * @param {string} message
     */
    static warn(message: string): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Warn,
            color: "yellow",
            prefix: "warn"
        };

        return Log.compose(options);
    }

    /**
     * @param {string} message
     */
    static error(message: string): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Error,
            color: "red",
            prefix: "dang"
        };

        return Log.compose(options);
    }

    /**
     * @param {string} message
     * @param {boolean} exit
     */
    static throw(message: string, exit: boolean = true): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Fatal,
            color: "red",
            prefix: "fata"
        };

        const result = Log.compose(options);

        if (exit) {
            process.exit(1);
        }

        return result;
    }

    /**
     * @param {string} message
     */
    static verbose(message: string): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Verbose,
            color: "grey",
            prefix: "verb"
        };

        return Log.compose(options);
    }

    /**
     * @param {string} message
     */
    static debug(message: string): Promise<any> {
        const options: ComposeOptions = {
            message: message,
            type: LogLevel.Debug,
            color: "magenta",
            prefix: "dbug"
        };

        return Log.compose(options);
    }
}
