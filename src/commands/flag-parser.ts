import Pattern from "../core/pattern";

export interface ICommandFlag {
    readonly key: string;
    readonly value: string | null;
    readonly short: boolean;
}

export default abstract class FlagParser {
    public static getSwitches(commandString: string): ICommandFlag[] {
        const result: ICommandFlag[] = [];

        let match: RegExpExecArray | null;

        while ((match = Pattern.flag.exec(commandString)) !== null) {
            if (match !== null) {
                result.push({
                    key: FlagParser.getKey(match),
                    short: FlagParser.isShort(match),
                    value: FlagParser.getValue(match)
                });
            }
        }

        return result;
    }

    protected static isShort(match: RegExpExecArray): boolean {
        return !match[0].startsWith("--") && match[0].startsWith("-");
    }

    protected static getKey(match: RegExpExecArray): string {
        return match[1] || match[4];
    }

    protected static getValue(match: RegExpExecArray): string | null {
        return match[2] || match[3] || null;
    }
}
