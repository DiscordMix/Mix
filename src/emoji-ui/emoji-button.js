export default class EmojiButton {
	/**
	 * @param {string} emoji
	 * @param {function} clickHandler
	 */
	constructor(emoji, clickHandler) {
		this.emoji = emoji;
		this.handle = clickHandler;
	}
}
