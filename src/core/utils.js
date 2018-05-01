import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import Log from "./log";

TimeAgo.locale(en);

const timeAgo = new TimeAgo("en-US");

export default class Utils {
	/**
	 * @param {string} mention
	 * @returns {string}
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
	 * @param {number} min
	 * @param {number} max
	 * @returns {number}
	 */
	static getRandomInt(min, max) {
		return Math.floor(Math.random() * max) + min;
	}

	/**
	 * @param array
	 * @returns {array}
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
	 * @param {String} footerSuffix
	 * @returns {Promise<Discord.Message>}
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
	 * @param {Number} seconds
	 * @param {Number} minutes
	 * @param {Number} hours
	 * @param {Number} days
	 * @param {Number} months
	 * @param {Number} years
	 * @returns {Number}
	 */
	static timeFromNow(milliseconds, seconds = 0, minutes = 0, hours = 0, days = 0, months = 0, years = 0) {
		const now = new Date();

		Log.info(now.getDate().toString());

		return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
	}

	/**
	 * @param {Number} timestamp
	 */
	static timeAgo(timestamp) {
		return timeAgo.format(timestamp);
	}

	/**
	 * @param {String} state
	 */
	static translateState(state) {
		return /^(1|true|on|y|yes)$/i.test(state);
	}
}
