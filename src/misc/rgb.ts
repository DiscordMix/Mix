export default class Rgb {
    readonly red: number;
    readonly green: number;
    readonly blue: number;

    /**
     * @param {Number} red
     * @param {Number} green
     * @param {Number} blue
     */
    constructor(red: number, green: number, blue: number) {
        /**
         * @type {Number}
         * @readonly
         */
        this.red = red;

        /**
         * @type {Number}
         * @readonly
         */
        this.green = green;

        /**
         * @type {Number}
         * @readonly
         */
        this.blue = blue;
    }

    /**
     * @return {String} The string equivalent
     */
    toString(): string {
        return `${this.red}, ${this.green}, ${this.blue}`;
    }
}
