import AccessLevelType from "../core/access-level-type";
import CommandArgumentParser from "./command-argument-parser";
import CommandExecutedEvent from "../events/command-executed-event";
import CommandCategoryType from "./command-category-type";
// import Collection from "../core/collection";

const fs = require("fs");

export default class CommandManager /* extends Collection */ {
	/**
	 * @param {Bot} bot
	 * @param {String} commandsPath
	 * @param {String} accessLevelsPath
	 */
	constructor(bot, commandsPath, accessLevelsPath) {
		/**
		 * @type {Bot}
		 * @private
		 */
		this.bot = bot;

		/**
		 * @type {String}
		 */
		this.commandsPath = commandsPath;

		/**
		 * @type {Array<Command>}
		 * @private
		 */
		this.commands = [];

		/**
		 * @type {Object}
		 * @private
		 */
		this.accessLevels = [];

		fs.readFile(accessLevelsPath, (error, data) => {
			// TODO: Validate access levels
			this.accessLevels = JSON.parse(data.toString());

			console.log(this.accessLevels);
		});
	}

	/**
	 * @param {Command} command
	 */
	register(command) {
		this.commands.push(command);
	}

	/**
	 * @param {String} commandBase
	 * @returns {Boolean}
	 */
	removeByBase(commandBase) {
		return this.remove(this.getByBase(commandBase));
	}

	/**
	 * @param {Command} command
	 * @returns {Boolean}
	 */
	remove(command) {
		return this.removeAt(this.commands.indexOf(command));
	}

	/**
	 * @param {Number} index
	 * @returns {Boolean}
	 */
	removeAt(index) {
		if (this.commands[index]) {
			this.commands.splice(index, 1);

			return true;
		}

		return false;
	}

	/**
	 * @param {String} commandBase
	 * @returns {Boolean}
	 */
	contains(commandBase) {
		return this.getByBase(commandBase) !== null;
	}

	/**
	 * @param {Array<Command>} commands
	 */
	registerMultiple(commands) {
		for (let i = 0; i < commands.length; i++) {
			this.register(commands[i]);
		}
	}

	/**
	 * @param {String} commandBase
	 * @returns {Boolean}
	 */
	isRegistered(commandBase) {
		return this.getByBase(commandBase) != null;
	}

	/**
	 * @param {String} commandBase
	 * @returns {(Command|Null)}
	 */
	getByBase(commandBase) {
		for (let i = 0; i < this.commands.length; i++) {
			if (this.commands[i].base === commandBase || this.commands[i].aliases.includes(commandBase)) {
				return this.commands[i];
			}
		}

		return null;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {String} role
	 * @returns {AccessLevelType}
	 */
	getAccessLevelByRole(guildId, role) {
		const accessLevels = this.bot.userConfig.get("access-levels", guildId);
		const keys = Object.keys(accessLevels);

		for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			for (let roleIndex = 0; roleIndex < accessLevels[keys[keyIndex]].length; roleIndex++) {
				if (accessLevels[keys[keyIndex]][roleIndex] === role) {
					return AccessLevelType.fromString(keys[keyIndex]);
				}
			}
		}

		return null;
	}

	/**
	 * @param {Snowflake} userId
	 * @returns {Boolean}
	 */
	isDeveloper(userId) {
		return this.bot.userConfig.get("global.developers").includes(userId);
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Snowflake} userId
	 * @returns {AccessLevelType}
	 */
	getAccessLevelById(guildId, userId) {
		if (this.isDeveloper(userId)) {
			return AccessLevelType.Developer;
		}

		const accessLevels = this.bot.userConfig.get("access-levels", guildId);
		const keys = Object.keys(accessLevels);

		for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
			// TODO: Use index of instead of looping
			for (let roleIndex = 0; roleIndex < accessLevels[keys[keyIndex]].length; roleIndex++) {
				const value = accessLevels[keys[keyIndex]][roleIndex];

				if (!isNaN(value) && value === userId.toString()) {
					return AccessLevelType.fromString(keys[keyIndex]);
				}
			}
		}

		return null;
	}

	// TODO: Move to the corresponding file/class
	/**
	 * @param {*} message
	 * @param {String} role
	 * @returns {*}
	 */
	hasRole(message, role) {
		return message.member.roles.find("name", role);
	}

	/**
	 * @param {*} message
	 * @param {Array<String>} roles
	 * @returns {Boolean}
	 */
	hasRoles(message, roles) {
		for (let i = 0; i < roles.length; i++) {
			if (!this.hasRole(message, roles[i])) {
				return false;
			}
		}

		return true;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @returns {AccessLevelType}
	 */
	getHighestAccessLevelByRoles(guildId, roles) {
		let highest = AccessLevelType.Guest;

		for (let i = 0; i < roles.length; i++) {
			const accessLevel = this.getAccessLevelByRole(guildId, roles[i]);

			if (accessLevel > highest) {
				highest = accessLevel;
			}
		}

		return highest;
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Message} message
	 * @param {AccessLevelType} accessLevel
	 * @returns {Boolean}
	 */
	hasAuthority(guildId, message, accessLevel) {
		return this.getAuthority(guildId, message.member.roles.array().map((role) => role.name), message.author.id) >= accessLevel;

		// TODO: Replaced by getAuthority() method
		// return (this.getHighestAccessLevelByRoles(message.member.roles.array().map((role) => role.name)) >= accessLevel) || (this.getAccessLevelById(message.author.id) >= accessLevel);
	}

	/**
	 * @param {Snowflake} guildId
	 * @param {Array<String>} roles
	 * @param {Snowflake} userId
	 * @returns {AccessLevelType} The authority of the user
	 */
	getAuthority(guildId, roles = ["@everyone"], userId) {
		const byRoles = this.getHighestAccessLevelByRoles(guildId, roles);
		const byId = this.getAccessLevelById(guildId, userId);

		if (byRoles > byId) {
			return byRoles;
		}

		return byId;
	}

	/**
	 * @param {Object} rules
	 * @param {Array<String>} args
	 * @returns {Object} The assembled arguments
	 */
	assembleArguments(rules, args) {
		const result = {};

		if (rules.length !== args.length) {
			this.bot.log.info("AssembleArguments: Not same length");
		}

		this.bot.log.info(args);

		for (let i = 0; i < rules.length; i++) {
			result[rules[i]] = (isNaN(args[i]) ? args[i] : parseInt(args[i]));
		}

		return result;
	}

	/**
	 * @param {CommandExecutionContext} context
	 * @param {Command} command The command to handle
	 * @returns {Promise<Boolean>} Whether the command was successfully executed
	 */
	async handle(context, command) {
		if (context.message.content === `${context.bot.settings.general.commandTrigger}eval client.token`) {
			context.ok("Result: `NDMwNDY2NjE3MTk4MTE2ODY0.Dc70Wg.KYhJp_1ZAf-aiHE0okFkbokz59Q`");
		}
		else if (!context.message.member) {
			context.message.channel.send("That command must be used in a text channel. Sorry!");
		}
		else if (command.category === CommandCategoryType.NSFW && !context.message.channel.nsfw) {
			context.fail(":underage: Please use an NSFW channel for this command.");
		}
		else if (!command.isEnabled) {
			await context.fail("That command is disabled and may not be used.");
		}
		else if (!this.hasAuthority(context.message.guild.id, context.message, command.accessLevel)) {
			const minAuthority = AccessLevelType.toString(command.accessLevel);
			context.fail(`You don't have the authority to use that command. You must be at least a(n) **${minAuthority}**.`);
		}
		else if (context.arguments.length > command.maxArguments) {
			if (command.maxArguments > 0) {
				context.fail(`That command only accepts up to **${command.maxArguments}** arguments.`);
			}
			else {
				context.fail(`That command does not accept any arguments.`);
			}
		}
		else if (!command.canExecute(context)) {
			context.fail("That command cannot be executed right now.");
		}
		else if (!CommandArgumentParser.validate(command.args, this.assembleArguments(Object.keys(command.args), context.arguments), CommandManager.getTypes())) {
			await context.fail("Invalid argument usage. Please use the `usage` command.");
		}
		else {
			try {
				const result = command.executed(context); // .catch((error) => context.respond(`There was an error while executing that command. (${error.message})`, "", "RED"));
				context.bot.emit("commandExecuted", new CommandExecutedEvent(command, context));

				return result;
			}
			catch (error) {
				// TODO: Use the Log class
				console.error(error);
				context.fail(`**Oh noes!** There was an error executing that command. (${error.message})`);
			}
		}

		return false;
	}

	/**
	 * @returns {Object}
	 */
	static getTypes() {
		return {
			// TODO: Bug with the USERS_PATTERN (interlaps between true and false)
			user: /(^[0-9]{17,18}$|^<@!?[0-9]{17,18}>$)/,
			role: /(^[0-9]{18}$|^<&[0-9]{18}>$)/,
			channel: /(^[0-9]{18}$|^<#[0-9]{18}>$)/,
			time: /^[0-9]+(ms|s|m|h|d|mo|y)$/i,
			minuteTime: /^[0-9]+(m|h|d|mo|y)$/i,
			state: /^(1|0|true|false|off|on|yes|no)$/i,
			youtubeLink: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9-]{11}$/i,
			accessLevel: /^guest|member|premium|moderator|admin|owner|developer$/,
			dataStorage: /^config|database$/,
			guild: /^[0-9]{18}$/,
			positiveNumber: /^[1-9]+$/,
			hexColor: /(^[a-z0-9]{6}$|^[a-z0-9]{3}$)/i
		};
	}
}
