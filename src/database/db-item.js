export default class DbItem {
	/**
	 * @param {number} id
	 * @param {Snowflake} userId
	 * @param {string} name
	 * @param {string} key
	 * @param {number} value
	 * @param {number} amount
	 */
	constructor(id, userId, name, key, value, amount) {
		this.id = id;
		this.userId = userId;
		this.name = name;
		this.key = key;
		this.value = value;
		this.amount = amount;
	}

	/**
	 * @param {object} queryResult
	 * @returns {DbItem}
	 */
	static fromResult(queryResult) {
		return new DbItem(
			queryResult.id,
			queryResult.user_id,
			queryResult.name,
			queryResult.key,
			queryResult.value,
			queryResult.amount
		);
	}

	/**
	 * @param {array<object>} queryResults
	 * @returns {array<DbItem>}
	 */
	static fromResults(queryResults) {
		return queryResults.map((queryResult) => DbItem.fromResult(queryResult));
	}
}
