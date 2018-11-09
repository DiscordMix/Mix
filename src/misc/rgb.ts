export default class Rgb {
    public readonly red: number;
    public readonly green: number;
    public readonly blue: number;

    /**
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     */
    public constructor(red: number, green: number, blue: number) {
        /**
         * @type {number}
         * @readonly
         */
        this.red = red;

        /**
         * @type {number}
         * @readonly
         */
        this.green = green;

        /**
         * @type {number}
         * @readonly
         */
        this.blue = blue;
    }

    /**
     * @return {string} The string equivalent
     */
    public toString(): string {
        return `${this.red}, ${this.green}, ${this.blue}`;
    }
}
