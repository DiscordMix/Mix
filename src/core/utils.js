import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.locale(en);

const fs = require("fs");
const timeAgo = new TimeAgo("en-US");

export default class Utils {
    /**
     * @param {String} mention
     * @returns {String}
     */
    static resolveId(mention) {
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
     * @return {Number}
     */
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * max) + min;
    }

    /**
     * @param {Array} array
     * @return {Array}
     */
    static shuffle(array) {
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
    static async send(options, requester, channel, footerSuffix = "") {
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
    static timeFromNow(milliseconds, seconds = 0, minutes = 0, hours = 0, days = 0, months = 0, years = 0) {
        const now = new Date();

        return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
    }

    /**
     * @param {Number} timestamp
     * @return {String}
     */
    static timeAgo(timestamp) {
        return timeAgo.format(timestamp);
    }

    /**
     * @param {Number} timestamp
     * @returns {String}
     */
    static timeAgoFromNow(timestamp) {
        return Utils.timeAgo(Date.now() - timestamp);
    }

    /**
     * @param {String} state
     * @return {Boolean}
     */
    static translateState(state) {
        return /^(1|true|on|y|yes)$/i.test(state);
    }

    /**
     * @param {String} path
     * @param {Object} data
     * @return {Promise}
     */
    static async writeJson(path, data) {
        return new Promise((resolve) => {
            fs.writeFile(path, JSON.stringify(data), (error) => {
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
    static async readJson(path) {
        return new Promise((resolve) => {
            fs.readFile(path, (error, data) => {
                if (error) {
                    throw error;
                }

                resolve(JSON.parse(data.toString()));
            });
        });
    }
}
