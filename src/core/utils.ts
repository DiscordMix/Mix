const fs = require("fs");
const TimeAgo: any = require("javascript-time-ago");
const en: any = require("javascript-time-ago/locale/en");

TimeAgo.locale(en);

const timeAgo = new TimeAgo("en-US");

export default class Utils {
    /**
     * @param {String} mention
     * @returns {String}
     */
    static resolveId(mention: string) {
        return mention
            .replace("<", "")
            .replace(">", "")
            .replace("@", "")
            .replace("!", "")
            .replace("&", "")
            .replace("#", "");
    }

    /**
     * @param {Number} min
     * @param {Number} max
     * @return {Number} The random number
     */
    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * max) + min;
    }

    /**
     * @param {Array<*>} array The array to shuffle
     * @return {Array<*>} The shuffled array
     */
    static shuffle(array: Array<any>) {
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
     * @param {String} [footerSuffix=""]
     * @return {Promise<Discord.Message>}
     */
    static async send(options: any, requester: any, channel: any, footerSuffix = "") {
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
     * @param {Number} milliseconds
     * @param {Number} [seconds=0]
     * @param {Number} [minutes=0]
     * @param {Number} [hours=0]
     * @param {Number} [days=0]
     * @param {Number} [months=0]
     * @param {Number} [years=0]
     * @return {Number}
     */
    static timeFromNow(milliseconds: number, seconds: number = 0, minutes: number = 0, hours: number = 0, days: number = 0, months: number = 0, years: number = 0) {
        const now = new Date();

        return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
    }

    /**
     * @param {Number} timestamp
     * @return {String}
     */
    static timeAgo(timestamp: number) {
        return timeAgo.format(timestamp);
    }

    /**
     * @param {Number} timestamp
     * @returns {String}
     */
    static timeAgoFromNow(timestamp: number) {
        return Utils.timeAgo(Date.now() - timestamp);
    }

    /**
     * @param {String} state
     * @return {Boolean}
     */
    static translateState(state: string) {
        return /^(1|true|on|y|yes)$/i.test(state);
    }

    /**
     * @param {String} path
     * @param {Object} data
     * @return {Promise}
     */
    static async writeJson(path: string, data: any) {
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
     * @param {String} path
     * @return {Promise<Object>}
     */
    static async readJson(path: string) {
        return new Promise((resolve) => {
            fs.readFile(path, (error: any, data: any) => {
                if (error) {
                    throw error;
                }

                resolve(JSON.parse(data.toString()));
            });
        });
    }

    /**
     * @param {String} string The string to escape
     * @returns {String} The escaped string
     */
    static escapeRegexString(string: string) {
        return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
}
