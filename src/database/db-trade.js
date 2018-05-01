export default class DbTrade {
	/**
	 * @param {number} id
	 * @param {Snowflake} messageId
	 * @param {Snowflake} senderId
	 * @param {Snowflake} recipientId
	 * @param {array<number>} itemsProposed
	 * @param {array<number>} itemsDemanded
	 * @param {TradeState} state
	 */
	constructor(id, messageId, senderId, recipientId, itemsProposed, itemsDemanded, state) {
		this.id = id;
		this.messageId = messageId;
		this.senderId = senderId;
		this.recipientId = recipientId;
		this.itemsDemanded = itemsProposed;
		this.itemsDemanded = itemsDemanded;
		this.state = state;
	}

	/**
	 * @param {object} queryResult
	 * @returns {(DbTrade|null)}
	 */
	static fromResult(queryResult) {
		if (queryResult) {
			return new DbTrade(
				queryResult.id,
				queryResult.message_id,
				queryResult.sender_id,
				queryResult.recipient_id,
				JSON.parse(queryResult.items_proposed),
				JSON.parse(queryResult.items_demanded),
				queryResult.state
			);
		}

		return null;
	}

	/**
	 * @param {array<object>} queryResults
	 * @returns {array<DbTrade>}
	 */
	static fromResults(queryResults) {
		return queryResults.map((queryResult) => DbTrade.fromResult(queryResult));
	}
}
