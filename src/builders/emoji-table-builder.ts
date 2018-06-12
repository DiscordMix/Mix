export default class EmojiTableBuilder {
    readonly width: number;
    readonly height: number;

    // 2D Array
    private readonly table: Array<any>;

    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.table = [];
    }

    /**
     * @param {number} col
     * @param {number} row
     * @param {string} emoji
     */
    set(col: number, row: number, emoji: string): void {
        this.table[col][row] = emoji;
    }

    /**
     * @return {string}
     */
    build(): string {
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
