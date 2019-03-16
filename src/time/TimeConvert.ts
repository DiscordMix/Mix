import Log from "../core/log";

export default abstract class TimeConvert {
    public static format(time: number, format: string): string {
        if (typeof time !== "number") {
            throw Log.error("Expecting time parameter to be a number");
        }
        else if (typeof format !== "string") {
            throw Log.error("Expecting format parameter to be a string");
        }

        const milliseconds: number = time;
        const seconds: number = milliseconds / 1000;
        const minutes: number = seconds / 60;
        const hour: number = minutes / 60;

        // Hour(s).
        while (format.includes("%h")) {
            format = format.replace("%h", hour.toString());
        }

        // Minute(s).
        while (format.includes("%m")) {
            format = format.replace("%m", minutes.toString());
        }

        // Second(s).
        while (format.includes("%s")) {
            format = format.replace("%s", seconds.toString());
        }

        // Millisecond(s).
        while (format.includes("%i")) {
            format = format.replace("%i", milliseconds.toString());
        }

        return format;
    }
}
