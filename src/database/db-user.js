export default class DbUser {
	/**
	 * @param {Snowflake} userId
	 * @param {number} thanks
	 * @param {number} points
	 * @param {boolean} isScopeLocked
	 * @param {array<string>} badges
	 * @param {string} afkMessage
	 * @param {number} spamThresholdStrikes
	 */
	constructor(userId, thanks, points, isScopeLocked, badges, afkMessage, spamThresholdStrikes) {
		this.userId = userId;
		this.thanks = thanks;
		this.points = points;
		this.isScopeLocked = isScopeLocked;
		this.badges = badges;
		this.afkMessage = afkMessage;
		this.spamThresholdTrikes = spamThresholdStrikes;
	}

	/**
	 * @param {object} queryResult
	 * @returns {DbUser}
	 */
	static fromResult(queryResult) {
		return new DbUser(
			queryResult.user_id,
			queryResult.thanks,
			queryResult.points,
			queryResult.is_scope_locked,
			JSON.parse(queryResult.badges),
			queryResult.afk_message,
			queryResult.spam_threshold_strikes
		);
	}

	/**
	 * @param {array<object>} queryResults
	 * @returns {array<DbUser>}
	 */
	static fromResults(queryResults) {
		return queryResults.map((queryResult) => DbUser.fromResult(queryResult));
	}
}
