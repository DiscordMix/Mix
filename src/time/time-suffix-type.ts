/**
 * @enum {number}
 * @readonly
 */
const TimeSuffixType = {
    Millisecond: 0,
    Second: 1,
    Minute: 2,
    Hour: 3,
    Day: 4,
    Month: 5,
    Year: 6,

    /**
     * @todo Return type
     * @param {string} short The short suffix
     * @return {TimeSuffixType}
     */
    fromShort(short: string): any {
        switch (short) {
            case "ms": {
                return this.Millisecond;
            }

            case "s": {
                return this.Second;
            }

            case "m": {
                return this.Minute;
            }

            case "h": {
                return this.Hour;
            }

            case "d": {
                return this.Day;
            }

            case "mo": {
                return this.Month;
            }

            case "y": {
                return this.Year;
            }

            default: {
                throw new Error(`[TimeSuffixType.fromShort] Invalid time suffix type: ${short}`);
            }
        }
    }
};

export default TimeSuffixType;
