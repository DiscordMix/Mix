export default class EmojiButton {
    readonly emoji: string;
    readonly handle: Function;

    /**
     * @param {String} emoji
     * @param {Function} clickHandler
     */
    constructor(emoji: string, clickHandler: Function) {
        /**
         * @type {String}
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
