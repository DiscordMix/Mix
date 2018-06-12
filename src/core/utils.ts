const fs = require("fs");
const TimeAgo: any = require("javascript-time-ago");
const en: any = require("javascript-time-ago/locale/en");

TimeAgo.locale(en);

const timeAgo = new TimeAgo("en-US");

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
     * @param {number} min
     * @param {number} max
     * @return {number} The random number
     */
    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * max) + min;
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
     * @param {Object} options
     * @param {User} requester
     * @param {Discord.Channel} channel
     * @param {string} [footerSuffix=""]
     * @return {Promise<Discord.Message>}
     */
    static async send(options: any, requester: any, channel: any, footerSuffix = ""): any {
        const optionsCpy = options;

        optionsCpy.footer = {
            icon_url: requester.avatarURL,
            text: `Requested by ${requester.username} ${footerSuffix}`
        };

        if (!optionsCpy.color) {
            // TODO: Color is literal hex, not string (gives error)
            optionsCpy.color = "GREEN";
        }

        return await channel.send({
            embed: options
        });
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
     * @return {string}
     */
    static timeAgo(timestamp: number): string {
        return timeAgo.format(timestamp);
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
     * @return {boolean}
     */
    static translateState(state: string): boolean {
        return /^(1|true|on|y|yes)$/i.test(state);
    }

    /**
     * @param {string} path
     * @param {Object} data
     * @return {Promise}
     */
    static async writeJson(path: string, data: any): Promise<any> {
        return new Promise((resolve) => {
            fs.writeFile(path, JSON.stringify(data), (error: any) => {
                if (error) {
                    throw error;
                }

                resolve();
            });
        });
    }

    /**
     * @param {string} path
     * @return {Promise<Object>}
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
     * @param {string} string The string to escape
     * @return {string} The escaped string
     */
    static escapeRegexString(string: string): string {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    static async getAnvilVersion(): Promise<string> {
        // TODO
        // return (await this.readJson("package.json")).version;

        // TODO: Hard coded
        return "1.1.21";
    }
}
