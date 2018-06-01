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

export default class Log {
    static level: LogLevel = LogLevel.Success;

    /**
     * @param {string} message
     * @param {LogLevel} type
     * @param {string} color
     * @param {string} prefix
     * @return {Promise<void>}
     */
    static async compose(message: string, type: LogLevel, color: string = "white", prefix: string = ""): Promise<any> {
        return new Promise((resolve) => {
            // TODO: Make sure check is working as inteded, seems a bit suspicious
            if (Log.level < type) {
                resolve();

                return;
            }

            const date = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

            // TODO: Make this next line work on the vps
            // process.stdout.write(`\x1B[2D[${date}] ${colors[color](message)}\n> `);
            console.log(`[${date}] ${colors[color](message)}`);

            if (prefix !== null) {
                message = `<${prefix.toUpperCase()}> ${message}`;
            }

            fs.writeFile("bot.log", `[${date}] ${message}\n`, {
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
        return Log.compose(message, LogLevel.Info, "cyan", "info");
    }

    /**
     * @param {string} message
     */
    static success(message: string): Promise<any> {
        return Log.compose(message, LogLevel.Success, "green", "sucs");
    }

    /**
     * @param {string} message
     */
    static warn(message: string): Promise<any> {
        return Log.compose(message, LogLevel.Warn, "yellow", "warn");
    }

    /**
     * @param {string} message
     */
    static error(message: string): Promise<any> {
        return Log.compose(message, LogLevel.Error, "red", "dang");
    }

    /**
     * @param {string} message
     * @param {boolean} exit
     */
    static throw(message: string, exit: boolean = true): Promise<any> {
        const result = Log.compose(message, LogLevel.Fatal, "red", "dang")

        if (exit) {
            process.exit(1);
        }

        return result;
    }

    /**
     * @param {string} message
     */
    static verbose(message: string): Promise<any> {
        return Log.compose(message, LogLevel.Verbose, "grey", "verb");
    }

    /**
     * @param {string} message
     */
    static debug(message: string): Promise<any> {
        return Log.compose(message, LogLevel.Debug, "magenta", "dbug");
    }
}
