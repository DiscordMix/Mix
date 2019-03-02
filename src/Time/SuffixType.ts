import Log from "../core/Log";

namespace Time {
    export const SuffixType = {
        Millisecond: 0,
        Second: 1,
        Minute: 2,
        Hour: 3,
        Day: 4,
        Month: 5,
        Year: 6,

        // TODO: Return type.
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
                    throw Log.error(`Invalid time suffix type: ${short}`);
                }
            }
        }
    };
}
