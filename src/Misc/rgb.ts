export default class Rgb {
    public readonly red: number;
    public readonly green: number;
    public readonly blue: number;

    public constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    /**
     * @return {string} The string equivalent.
     */
    public toString(): string {
        return `${this.red}, ${this.green}, ${this.blue}`;
    }
}
