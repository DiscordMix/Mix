import EmojiButton from "./emoji-button";

export default class EmojiMenu {
    readonly buttons: Array<EmojiButton>;
    readonly content: string;

    /**
     * @param {Array<EmojiButton>} buttons
     * @param {string} content
     */
    constructor(buttons: Array<EmojiButton>, content: string) {
        /**
         * @type {Array<EmojiButton>}
         * @readonly
         */
        this.buttons = buttons;

        /**
         * @type {string}
         * @readonly
         */
        this.content = content;
    }
}
