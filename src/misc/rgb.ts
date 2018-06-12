export default class Rgb {
    readonly red: number;
    readonly green: number;
    readonly blue: number;

    /**
     * @param {number} red
     * @param {number} green
     * @param {number} blue
     */
    constructor(red: number, green: number, blue: number) {
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
    toString(): string {
        return `${this.red}, ${this.green}, ${this.blue}`;
    }
}
