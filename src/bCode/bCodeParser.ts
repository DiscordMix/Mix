export interface IBCodeDelimiters {
    readonly start: string;
    readonly end: string;
}

const defaultDelimiters: IBCodeDelimiters = {
    start: "{",
    end: "}"
};

export interface IBCodeMatch {
    readonly content: string;
    readonly pos: number;
}

export default class BCodeParser {
    public static createMatcher(delimiters: IBCodeDelimiters): RegExp {
        return new RegExp(`${delimiters.start}[^${delimiters.end}]+${delimiters.end}`, "gm");
    }

    public readonly delimiters: IBCodeDelimiters;

    protected readonly matcher: RegExp;

    public constructor(delimiters: IBCodeDelimiters = defaultDelimiters) {
        this.delimiters = delimiters;
        this.matcher = BCodeParser.createMatcher(this.delimiters);
    }

    /**
     * Parse an input string and test it against
     * specified delimiters. Returns a match array
     * containing all matched substrings, or an empty
     * array if no matches were found.
     */
    public parse(input: string): IBCodeMatch[] {
        const matches: RegExpExecArray | null = this.matcher.exec(input);

        // No match was found.
        if (matches === null) {
            return [];
        }

        // Otherwise, map the matches into a BCode match array.
        return matches.map((value: string) => {
            return {
                content: value,

                // TODO: Implement.
                pos: 0
            };
        });
    }
}
