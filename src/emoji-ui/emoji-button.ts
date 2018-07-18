export default class EmojiButton {
    readonly emoji: string;
    readonly handle: Function;

    /**
     * @todo Function parameters and types
     * @param {string} emoji
     * @param {Function} clickHandler
     */
    constructor(emoji: string, clickHandler: Function) {
        /**
         * The emoji to trigger the button
         * @type {string}
         * @readonly
         */
        this.emoji = emoji;

        /**
         * The method called when the emoji is clicked
         * @type {Function}
         * @readonly
         */
        this.handle = clickHandler;
    }
}
