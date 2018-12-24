import TimeSuffixType from "./time-suffix-type";
import Utils from "../core/utils";

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
