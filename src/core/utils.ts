import {RichEmbed, User} from "discord.js";
import fs from "fs";
import path from "path";

const TimeAgo: any = require("javascript-time-ago");
const en: any = require("javascript-time-ago/locale/en");

TimeAgo.locale(en);

const timeAgo = new TimeAgo("en-US");

export interface SendOptions {
    readonly user: User;
    readonly channel: any/* TextChannel | GroupDMChannel | DMChannel | GuildChannel */; // TODO: Type
    readonly message: string;
    readonly color?: string;
    readonly footer?: string;
    readonly title?: string;
}

export default class Utils {
    /**
     * @param {string} mention
     * @return {string}
     */
    static resolveId(mention: string): string {
        return mention
            .replace("<", "")
            .replace(">", "")
            .replace("@", "")
            .replace("!", "")
            .replace("&", "")
            .replace("#", "");
    }

    /**
     * @param {number} min The minimum amount
     * @param {number} max The maximum amount
     * @return {number} The random number
     */
    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * max) + min;
    }

    /**
     * @param {string} directory The directory to scan
     * @param {boolean} [absolutePath=false] Whether to return the absolute path of the files
     */
    public static getFiles(directory: string, absolutePath: boolean = false): Promise<Array<string> | null> {
        return new Promise((resolve) => {
            if (!fs.existsSync(directory)) {
                resolve(null);

                return;
            }
    
            fs.readdir(directory, (error: Error, files: Array<string>) => {
                if (error) {
                    throw new Error(`[Utils.getFiles] There was an error while reading directory '${directory}': ${error.message}`);
                }

                let result: Array<string> = files;

                if (absolutePath) {
                    for (let i = 0; i < result.length; i++) {
                        result[i] = path.resolve(path.join(directory, result[i]));
                    }
                }

                resolve(result);

                return;
            });
        });
    }

    /**
     * @param {Array<*>} array The array to shuffle
     * @return {Array<*>} The shuffled array
     */
    static shuffle(array: Array<any>): Array<any> {
        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            const index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            const temp = array[counter];

            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    /**
     * @todo Return type
     * @param {SendOptions} options
     * @return {Promise<Discord.Message>} The message sent
     */
    static async send(options: SendOptions): Promise<any> {
        return await options.channel.send(new RichEmbed()
            .setColor(options.color ? options.color : "GREEN")
            .setTitle(options.title ? options.title : "")
            .setFooter(options.footer, options.user.avatarURL)
            .setDescription(options.message));
    }

    /**
     * @param {number} milliseconds
     * @param {number} [seconds=0]
     * @param {number} [minutes=0]
     * @param {number} [hours=0]
     * @param {number} [days=0]
     * @param {number} [months=0]
     * @param {number} [years=0]
     * @return {number}
     */
    static timeFromNow(milliseconds: number, seconds: number = 0, minutes: number = 0, hours: number = 0, days: number = 0, months: number = 0, years: number = 0): number {
        const now = new Date();

        return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
    }

    /**
     * @param {number} timestamp
     * @param {boolean} capitalize Whether to capitalize the time
     * @return {string}
     */
    static timeAgo(timestamp: number, capitalize: boolean = true): string {
        let time: string = timeAgo.format(timestamp);

        if (capitalize) {
            time = time.charAt(0).toUpperCase() + time.slice(1);
        }

        return time;
    }

    /**
     * @param {number} timestamp
     * @return {string}
     */
    static timeAgoFromNow(timestamp: number): string {
        return Utils.timeAgo(Date.now() - timestamp);
    }

    /**
     * @param {string} state
     * @return {boolean} Whether the state string representation was positive
     */
    static translateState(state: string): boolean {
        return /^(1|true|on|y|yes)$/i.test(state);
    }

    /**
     * @param {string} path
     * @param {Object} data
     * @return {Promise<*>}
     */
    static async writeJson(path: string, data: any): Promise<any> {
        return new Promise((resolve) => {
            fs.writeFile(path, JSON.stringify(data), (error: Error) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * @param {string} path
     * @return {Promise<Object>} The data from the specified path
     */
    static async readJson(path: string): Promise<any> {
        return new Promise((resolve) => {
            fs.readFile(path, (error: Error, data: any) => {
                if (error) {
                    throw error;
                }

                resolve(JSON.parse(data.toString()));
            });
        });
    }

    /**
     * @param {string} string The string to escape regex of
     * @return {string} The escaped string
     */
    static escapeRegexString(string: string): string {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * @return {Promise<string>}
     */
    static async getAnvilVersion(): Promise<string> {
        // TODO
        // return (await this.readJson("package.json")).version;

        // TODO: Hard coded
        return "1.1.22";
    }
}
