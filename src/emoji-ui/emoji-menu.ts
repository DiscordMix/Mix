import EmojiButton from "./emoji-button";

export default class EmojiMenu {
    readonly buttons: Array<EmojiButton>;
    readonly content: string;

    /**
     * @param {Array<EmojiButton>} buttons
     * @param {String} content
     */
    constructor(buttons: Array<EmojiButton>, content: string) {
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
