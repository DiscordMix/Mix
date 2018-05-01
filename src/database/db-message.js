export default class DbMessage {
	/**
	 * @param {number} id
	 * @param {Snowflake} sender
	 * @param {string} senderName
	 * @param {string} text
	 * @param {number} channel
	 * @param {number} time
	 */
	constructor(id, sender, senderName, text, channel, time) {
		this.id = id;
		this.sender = sender;
		this.senderName = senderName;
		this.text = text;
		this.channel = channel;
		this.time = time;
	}

	/**
	 * @param {object} queryResult
	 * @returns {DbMessage}
	 */
	static fromResult(queryResult) {
		return new DbMessage(
			queryResult.id,
			queryResult.sender,
			queryResult.sender_name,
			queryResult.text,
			queryResult.channel,
			queryResult.time
		);
	}

	/**
	 * @param {array<object>} queryResults
	 * @returns {array<DbMessage>}
	 */
	static fromResults(queryResults) {
		return queryResults.map((queryResult) => DbMessage.fromResult(queryResult));
	}
}
