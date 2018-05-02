export default class EmojiButton {
	/**
	 * @param {String} emoji
	 * @param {Function} clickHandler
	 */
	constructor(emoji, clickHandler) {
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
