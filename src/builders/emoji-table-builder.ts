export default class EmojiTableBuilder {
    public readonly width: number;
    public readonly height: number;

    // 2D Array
    private readonly table: any[];

    /**
     * @param {number} width
     * @param {number} height
     */
    public constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.table = [];
    }

    /**
     * @param {number} col
     * @param {number} row
     * @param {string} emoji
     */
    public set(col: number, row: number, emoji: string): void {
        this.table[col][row] = emoji;
    }

    /**
     * @return {string}
     */
    public build(): string {
        let result = "";

        for (let col = 0; col < this.height; col++) {
            for (let row = 0; row < this.width; row++) {
                result += this.table[col][row];
            }

            result += "\n";
        }

        return result;
    }
}
