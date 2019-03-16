import TimeSuffixType from "./TimeSuffixType";
import Util from "../core/Util";
import Log from "../core/log";

export default class TimeParser {
    public readonly timeString: string;

    public constructor(timeString: string) {
        this.timeString = timeString;
    }

    public getMatch(): any {
        return /^([0-9]+)(ms|s|m|h|d|mo|y)$/.exec(this.timeString);
    }

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

    // TODO: Return type.
    public get suffix(): any {
        return TimeSuffixType.fromShort(this.getMatch()[2]);
    }

    public get amount(): number {
        return parseInt(this.getMatch()[1]);
    }
}
