import Log from "../core/log";
import DbUser from "./db-user";
import DbItem from "./db-item";
import TradeState from "../core/trade-state";
import DbTrade from "./db-trade";
import TradeItem from "../core/trade-item";

const fs = require("fs");

export default class Database {
	/**
	 * @param {string} path
	 */
	constructor(path) {
		this.path = path;

		if (!fs.existsSync(path)) {
			Log.error("[Database] Invalid database file path");
		}

		this.db = require("knex")({
			client: "sqlite3",

			connection: {
				filename: path
			},

			useNullAsDefault: true
		});
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {Promise<DbUser>}
	 */
	async getUser(userId) {
		const result = (await this.db.select().from("users").where("user_id", userId.toString()).limit(1)
			.then())[0];

		if (!result) {
			// TODO: Row id should not be null
			const newUser = new DbUser(userId, 0, 0, false, [], "", 0);

			await this.addUser(newUser);

			return newUser;
		}

		return DbUser.fromResult(result);
	}

	/**
	 * @param {Snowflake} userId
	 * @param {number} points
	 */
	async setUserPoints(userId, points) {
		// TODO: Only calling to create the user
		await this.getUser(userId);

		this.db("users").where("user_id", userId.toString()).update({
			points: points
		}).then();
	}

	/**
	 * @param {Snowflake} userId
	 * @param {BadgeType} badge
	 * @returns {Promise<void>}
	 */
	async addUserBadge(userId, badge) {
		const { badges } = (await this.getUser(userId));

		// TODO: Make use of this check
		if (!badges.includes(badge)) {
			badges.push(badge);
		}

		this.db("users").where("user_id", userId.toString()).update({
			badges: JSON.stringify(badges)
		}).then();
	}

	/**
	 * @param {Snowflake} userId
	 * @param {boolean} isScopeLocked
	 */
	setUserScopeLocked(userId, isScopeLocked) {
		this.db("users").where("user_id", userId.toString()).update({
			is_scope_locked: isScopeLocked
		}).then();
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {number}
	 */
	async getUserPoints(userId) {
		return (await this.getUser(userId)).points;
	}

	/**
	 * @param {Snowflake} userId
	 * @param {number} amount
	 * @returns {number}
	 */
	async addUserPoints(userId, amount) {
		let points = (await this.getUserPoints(userId)) + amount;

		if (points < 0) {
			points = 0;
		}

		await this.setUserPoints(userId, points);

		return points;
	}

	/**
	 * @param {DbUser} dbUser
	 */
	addUser(dbUser) {
		this.db("users").insert({
			user_id: dbUser.userId,
			thanks: dbUser.thanks,
			points: dbUser.points,
			is_scope_locked: dbUser.isScopeLocked,
			badges: JSON.stringify(dbUser.badges),
			afk_message: dbUser.afkMessage,
			spam_threshold_strikes: dbUser.spamThresholdTrikes
		}).then();
	}

	/**
	 * @param {*} message
	 */
	addMessage(message) {
		this.db("messages").insert({
			sender: message.author.id.toString(),
			sender_name: message.author.username,
			text: message.content,
			channel: message.channel.id.toString(),
			time: message.createdTimestamp
		}).then();
	}

	/**
	 * @deprecated Use hasBeenThankedAsync instead
	 * @param {Snowflake} userId
	 * @param {function} callback
	 */
	hasBeenThanked(userId, callback) {
		this.db.select().from("thanks").where("user", userId.toString()).then((result) => {
			callback(result.length > 0);
		});
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {Promise<boolean>}
	 */
	async hasBeenThankedAsync(userId) {
		return (await this.db.select().from("thanks").where("user", userId.toString()).then()).length > 0;
	}

	/**
	 * @deprecated Use getThanksAsync instead
	 * @param {Snowflake} userId
	 * @param {function} callback
	 */
	getThanks(userId, callback) {
		this.hasBeenThanked(userId, (hasBeenThanked) => {
			if (!hasBeenThanked) {
				callback(0);
			} else {
				this.db.select().from("thanks").where("user", userId.toString()).then((result) => {
					callback(result[0].count);
				});
			}
		});
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {Promise<void>}
	 */
	async getThanksAsync(userId) {
		if (await this.hasBeenThankedAsync(userId) === false) {
			return 0;
		}

		return (await this.db.select().from("thanks").where("user", userId.toString()).then())[0].count;
	}

	/**
	 * @deprecated Use addThankAsync instead
	 * @param {Snowflake} userId
	 * @param {function} callback
	 */
	addThank(userId, callback) {
		this.hasBeenThanked(userId, (exists) => {
			if (!exists) {
				this.db("thanks").insert({
					user: userId.toString(),
					count: 1
				}).then(callback);
			} else {
				this.getThanks(userId, (thanks) => {
					this.db("thanks").where("user", userId.toString()).update({
						count: thanks + 1
					}).then(callback);
				});
			}
		});
	}

	/**
	 * @deprecated Use getMessagesAsync instead
	 * @param {Snowflake} userId
	 * @param {function} callback
	 * @param {number} limit
	 */
	getMessages(userId, callback, limit = 100) {
		this.db.select().from("messages").where("sender", userId.toString()).limit(limit)
			.orderBy("time", "desc")
			.then(callback);
	}

	/**
	 * @deprecated Use getWarningCountAsync instead
	 * @param {Snowflake} userId
	 * @param {function} callback
	 */
	getWarningCount(userId, callback) {
		this.db.select("count").from("warnings").where("user", userId).then((warnings) => {
			if (warnings.length > 0) {
				callback(warnings[0].count);
			} else {
				callback(0);
			}
		});
	}

	/**
	 * @deprecated Use hasBeenWarnedAsync instead
	 * @param {Snowflake} userId
	 * @param {function} callback
	 */
	hasBeenWarned(userId, callback) {
		this.db.select().from("warnings").where("user", userId.toString()).then((result) => {
			callback(result.length > 0);
		});
	}

	/**
	 * @param {Snowflake} userId
	 */
	addWarning(userId) {
		this.hasBeenWarned(userId, (hasBeenWarned) => {
			if (hasBeenWarned) {
				this.getWarningCount(userId, (warnings) => {
					Log.info(warnings);

					this.db("warnings").where("user", userId.toString()).update({
						count: warnings + 1
					}).then();
				});
			} else {
				this.db("warnings").insert({
					user: userId.toString(),
					count: 1
				}).then();
			}
		});
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {Promise<array<DbItem>>}
	 */
	async getItems(userId) {
		return DbItem.fromResults(await this.db.select().from("items").where("user_id", userId.toString()).then());
	}

	/**
	 * @param {Snowflake} userId
	 * @param {string} key
	 * @returns {Promise<DbItem>}
	 */
	async getItem(userId, key) {
		return (await this.db.select().from("items").where({
			user_id: userId,
			key: key
		}).limit(1)
			.then())[0];
	}

	/**
	 * @param {DbItem} dbItem
	 * @param {number} amount
	 */
	async addItem(dbItem, amount = 1) {
		const item = await this.getItem(dbItem.userId, dbItem.key);

		Log.info("added", item);

		if (!item) {
			this.db("items").insert({
				user_id: dbItem.userId.toString(),
				name: dbItem.name,
				key: dbItem.key,
				value: dbItem.value,
				amount: dbItem.amount
			}).then();
		}
		else {
			this.db("items").where({
				user_id: dbItem.userId,
				key: dbItem.key
			}).update({
				amount: item.amount + amount
			}).then();
		}
	}

	/**
	 * @param {Snowflake} senderId
	 * @returns {Promise<DbTrade>}
	 */
	async getActiveTradeBySender(senderId) {
		return DbTrade.fromResult((await this.db.select().from("trades").where({
			sender_id: senderId.toString(),
			state: TradeState.Preparing
		}).limit(1)
			.then())[0]);
	}

	/**
	 * @param {DbTrade} dbTrade
	 */
	addTrade(dbTrade) {
		this.db("trades").insert({
			message_id: dbTrade.messageId.toString(),
			sender_id: dbTrade.senderId.toString(),
			recipient_id: dbTrade.recipientId.toString(),
			items_proposed: JSON.stringify(dbTrade.itemsDemanded),
			items_demanded: JSON.stringify(dbTrade.itemsDemanded),
			state: dbTrade.state
		}).then();
	}

	/**
	 * @param {number} tradeId
	 * @param {TradeState} state
	 */
	setTradeState(tradeId, state) {
		this.db("trades").where("id", tradeId).update({
			state: state
		}).then();
	}

	/**
	 * @param {Snowflake} userId
	 * @param {string} message
	 */
	setAfkMessage(userId, message) {
		this.db("users").where("user_id", userId).update({
			afk_message: message.trim()
		}).then();
	}

	/**
	 * @param {number} itemId
	 * @returns {Promise<DbItem>}
	 */
	async getItemById(itemId) {
		return DbItem.fromResult((await this.db.select().from("items").where("id", itemId).limit(1)
			.then())[0]);
	}

	/**
	 * @param {number} tradeId
	 * @returns {Promise<array<DbItem>>}
	 */
	async getTradePropositions(tradeId) {
		// TODO: First check if it exists
		const itemsObj = JSON.parse((await this.db.select("items_proposed").from("trades").where("id", tradeId).limit(1)
			.then())[0].items_proposed);

		const result = [];

		Log.info(itemsObj);

		for (let i = 0; i < itemsObj.length; i++) {
			const item = await this.getItemById(itemsObj[i].id);

			item.amount = itemsObj[i].amount;

			result.push(item);
		}

		return result;
	}

	/**
	 * @param {Snowflake} tradeId
	 * @returns {Promise<array<DbItem>>}
	 */
	async getTradeDemands(tradeId) {
		// TODO: First check if it exists
		const itemsObj = JSON.parse((await this.db.select("items_demanded").from("trades").where("id", tradeId).limit(1)
			.then())[0].items_demanded);

		const result = [];

		for (let i = 0; i < itemsObj.length; i++) {
			const item = await this.getItemById(itemsObj[i].id);

			item.amount = itemsObj[i].amount;

			result.push(item);
		}

		return result;
	}

	/**
	 * @param {Snowflake} recipientId
	 * @returns {Promise<DbTrade>}
	 */
	async getPendingTradeByRecipient(recipientId) {
		return DbTrade.fromResult((await this.db.select().from("trades").where({
			recipient_id: recipientId.toString(),
			state: TradeState.Pending
		}).limit(1)
			.then())[0]);
	}

	/**
	 * @param {Snowflake} userId
	 * @param {DbItem} dbItem
	 * @param {number} amount
	 */
	async addTradeProposition(userId, dbItem, amount = 1) {
		// TODO: First check if it exists/if there is an active trade
		const { itemsDemanded } = (await this.getActiveTradeBySender(userId));

		itemsDemanded.push(new TradeItem(dbItem.id, amount));

		this.db("trades").where({
			sender_id: userId.toString(),
			state: TradeState.Preparing
		}).update({
			items_proposed: JSON.stringify(itemsDemanded)
		}).then();
	}

	/**
	 * @param {Snowflake} userId
	 * @param {DbItem} dbItem
	 * @param {number} amount
	 */
	async addTradeDemand(userId, dbItem, amount = 1) {
		// TODO: First check if it exists/if there is an active trade
		const { itemsDemanded } = (await this.getActiveTradeBySender(userId));

		itemsDemanded.push(new TradeItem(dbItem.id, amount));

		this.db("trades").where({
			sender_id: userId.toString(),
			state: TradeState.Preparing
		}).update({
			items_demanded: JSON.stringify(itemsDemanded)
		}).then();
	}

	// TODO: Consider merging with addItem method
	/**
	 * @param {Snowflake} userId
	 * @param {string} key
	 * @param {number} amount
	 * @returns {boolean}
	 */
	async removeItem(userId, key, amount = 1) {
		const item = await this.getItem(userId, key);

		if (item) {
			if ((item.amount - amount) <= 0) {
				this.db("items").where({
					user_id: userId.toString(),
					key: key
				}).del().then();

				return true;
			}

			this.db("items").where({
				user_id: userId.toString(),
				key: key
			}).update({
				amount: item.amount - amount
			}).then();
		}

		return false;
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {boolean}
	 */
	async removeAllItems(userId) {
		this.db("items").where({
			user_id: userId.toString()
		}).del().then();
	}
}
