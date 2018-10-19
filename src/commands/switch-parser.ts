import Patterns from "../core/patterns";

export type CommandSwitch = {
    readonly key: string;
    readonly value: string | null;
    readonly short: boolean;
}

export default abstract class SwitchParser {
    public static getSwitches(commandString: string): CommandSwitch[] {
        const result: CommandSwitch[] = [];

        let match: RegExpExecArray | null;

        while ((match = Patterns.commandSwitch.exec(commandString)) !== null) {
            if (match !== null) {
                result.push({
                    key: SwitchParser.getSwitchKey(match),
                    value: SwitchParser.getSwitchValue(match),
                    short: SwitchParser.isShortSwitch(match)
                });
            }
        }

        return result;
    }

    private static isShortSwitch(match: RegExpExecArray): boolean {
        return !match[0].startsWith("--") && match[0].startsWith("-");
    }

    private static getSwitchKey(match: RegExpExecArray): string {
        return match[1] || match[4];
    }

    private static getSwitchValue(match: RegExpExecArray): string | null {
        return match[2] || match[3] || null;
    }
}