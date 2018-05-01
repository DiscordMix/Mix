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
	 * @param {object} options
	 * @param {User} requester
	 * @param channel
	 * @param {string} footerSuffix
	 * @returns {Promise<Message>}
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
	 * @param {number} milliseconds
	 * @param {number} seconds
	 * @param {number} minutes
	 * @param {number} hours
	 * @param {number} days
	 * @param {number} months
	 * @param {number} years
	 * @returns {number}
	 */
	static timeFromNow(milliseconds, seconds = 0, minutes = 0, hours = 0, days = 0, months = 0, years = 0) {
		const now = new Date();

		Log.info(now.getDate());

		return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
	}

	/**
	 * @param {number} timestamp
	 */
	static timeAgo(timestamp) {
		return timeAgo.format(timestamp);
	}

	/**
	 * @param {string} state
	 */
	static translateState(state) {
		return /^(1|true|on|y|yes)$/i.test(state);
	}
}
