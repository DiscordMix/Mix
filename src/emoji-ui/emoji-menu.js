export default class EmojiMenu {
    /**
     * @param {Array<EmojiButton>} buttons
     * @param {String} content
     */
    constructor(buttons, content) {
        /**
         * @type {Array<EmojiButton>}
         * @readonly
         */
        this.buttons = buttons;

        /**
         * @type {String}
         * @readonly
         */
        this.content = content;
    }
}
