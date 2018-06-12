export default class EmojiButton {
    readonly emoji: string;
    readonly handle: Function;

    /**
     * @param {string} emoji
     * @param {Function} clickHandler
     */
    constructor(emoji: string, clickHandler: Function) {
        /**
         * @type {string}
         * @readonly
         */
        this.emoji = emoji;

        /**
         * @type {Function}
         * @readonly
         */
        this.handle = clickHandler;
    }
}
