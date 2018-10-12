import EmojiButton from "./emoji-button";

export default class EmojiMenu {
    public readonly buttons: EmojiButton[];
    public readonly content: string;

    /**
     * @param {EmojiButton[]} buttons
     * @param {string} content
     */
    constructor(buttons: EmojiButton[], content: string) {
        /**
         * @type {EmojiButton[]}
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
