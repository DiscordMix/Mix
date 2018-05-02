import TimeSuffixType from "./time-suffix-type";
import Utils from "./utils";

export default class TimeParser {
	/**
	 * @param {String} timeString
	 */
	constructor(timeString) {
		/**
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.timeString = timeString;
	}

	/**
	 * @returns {*}
	 */
	getMatch() {
		return /^([0-9]+)(ms|s|m|h|d|mo|y)$/.exec(this.timeString);
	}

	/**
	 * @returns {TimeSuffixType}
	 */
	get suffix() {
		return TimeSuffixType.fromShort(this.getMatch()[2]);
	}

	/**
	 * @returns {Number}
	 */
	get amount() {
		return parseInt(this.getMatch()[1]);
	}

	/**
	 * @returns {Number}
	 */
	getTimeFromNow() {
		switch (this.suffix) {
			case TimeSuffixType.Millisecond: {
				return Utils.timeFromNow(this.amount);
			}

			case TimeSuffixType.Second: {
				return Utils.timeFromNow(0, this.amount);
			}

			case TimeSuffixType.Minute: {
				return Utils.timeFromNow(0, 0, this.amount);
			}

			case TimeSuffixType.Hour: {
				return Utils.timeFromNow(0, 0, 0, this.amount);
			}

			case TimeSuffixType.Day: {
				return Utils.timeFromNow(0, 0, 0, 0, this.amount);
			}

			case TimeSuffixType.Month: {
				return Utils.timeFromNow(0, 0, 0, 0, 0, this.amount);
			}

			case TimeSuffixType.Year: {
				return Utils.timeFromNow(0, 0, 0, 0, 0, 0, this.amount);
			}

			default: {
				throw new Error(`[TimeParser.getTimeFromNow] Invalid suffix: ${this.suffix}`);
			}
		}
	}
}
