import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.locale(en);

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
	 * @returns {Number}
	 */
	static getRandomInt(min, max) {
		return Math.floor(Math.random() * max) + min;
	}

	/**
	 * @param {Array} array
	 * @returns {Array}
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

		return new Date(years + now.getFullYear(), months + now.getMonth(), days + now.getDate(), hours + now.getHours(), minutes + now.getMinutes(), seconds + now.getSeconds(), milliseconds + now.getMilliseconds()).getTime();
	}

	/**
	 * @param {Number} timestamp
	 * @returns {*}
	 */
	static timeAgo(timestamp) {
		return timeAgo.format(timestamp);
	}

	/**
	 * @param {String} state
	 * @returns {Boolean}
	 */
	static translateState(state) {
		return /^(1|true|on|y|yes)$/i.test(state);
	}
}
