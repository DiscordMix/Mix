import EmojiButton from "./emoji-button";

export default class EmojiMenu {
    public readonly buttons: Array<EmojiButton>;
    public readonly content: string;

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
