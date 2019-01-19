import TimeSuffixType from "./time-suffix-type";
import Util from "../core/util";
import Log from "../core/log";

export default class TimeParser {
    public readonly timeString: string;

    /**
     * @param {string} timeString
     */
    public constructor(timeString: string) {
        /**
         * @type {string}
         * @protected
         * @readonly
         */
        this.timeString = timeString;
    }

    /**
     * @return {*}
     */
    public getMatch(): any {
        return /^([0-9]+)(ms|s|m|h|d|mo|y)$/.exec(this.timeString);
    }

    /**
     * @return {number}
     */
    public getTimeFromNow(): number {
        switch (this.suffix) {
            case TimeSuffixType.Millisecond: {
                return Util.timeFromNow(this.amount);
            }

            case TimeSuffixType.Second: {
                return Util.timeFromNow(0, this.amount);
            }

            case TimeSuffixType.Minute: {
                return Util.timeFromNow(0, 0, this.amount);
            }

            case TimeSuffixType.Hour: {
                return Util.timeFromNow(0, 0, 0, this.amount);
            }

            case TimeSuffixType.Day: {
                return Util.timeFromNow(0, 0, 0, 0, this.amount);
            }

            case TimeSuffixType.Month: {
                return Util.timeFromNow(0, 0, 0, 0, 0, this.amount);
            }

            case TimeSuffixType.Year: {
                return Util.timeFromNow(0, 0, 0, 0, 0, 0, this.amount);
            }

            default: {
                throw Log.error(`Invalid suffix: ${this.suffix}`);
            }
        }
    }

    /**
     * @todo Return type
     * @return {TimeSuffixType}
     */
    public get suffix(): any {
        return TimeSuffixType.fromShort(this.getMatch()[2]);
    }

    /**
     * @return {number}
     */
    public get amount(): number {
        return parseInt(this.getMatch()[1]);
    }
}
