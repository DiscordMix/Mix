import Patterns from "../core/patterns";

export interface IFlag {
    readonly key: string;
    readonly value: string | null;
    readonly short: boolean;
}

export default abstract class FlagParser {
    public static getSwitches(commandString: string): IFlag[] {
        const result: IFlag[] = [];

        let match: RegExpExecArray | null;

        while ((match = Patterns.flag.exec(commandString)) !== null) {
            if (match !== null) {
                result.push({
                    key: FlagParser.getFlagKey(match),
                    short: FlagParser.isShortFlag(match),
                    value: FlagParser.getFlagValue(match)
                });
            }
        }

        return result;
    }

    protected static isShortFlag(match: RegExpExecArray): boolean {
        return !match[0].startsWith("--") && match[0].startsWith("-");
    }

    protected static getFlagKey(match: RegExpExecArray): string {
        return match[1] || match[4];
    }

    protected static getFlagValue(match: RegExpExecArray): string | null {
        return match[2] || match[3] || null;
    }
}
