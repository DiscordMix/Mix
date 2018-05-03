import AccessLevelType from "../commands/access-level-type";
import CommandArgumentParser from "./command-argument-parser";
import CommandExecutedEvent from "../events/command-executed-event";
import CommandCategoryType from "./command-category-type";
// import Collection from "../core/collection";

export default class CommandManager /* extends Collection */ {
	/**
	 * @param {Bot} bot
	 * @param {String} commandsPath
	 * @param {String} accessLevelsPath
	 * @param {Object} argumentTypes
	 */
	constructor(bot, commandsPath, accessLevelsPath, argumentTypes) {
		/**
		 * @type {Bot}
		 * @private
		 * @readonly
		 */
		this.bot = bot;

		/**
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.commandsPath = commandsPath;

		/**
		 * @type {String}
		 * @private
		 * @readonly
		 */
		this.accessLevelsPath = accessLevelsPath;

		/**
		 * @type {Object}
		 * @readonly
		 */
		this.argumentTypes = argumentTypes;

		/**
		 * @type {Array<Command>}
		 * @private
		 */
		this.commands = [];
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
		if (!context.message.member) {
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
		else if (!CommandArgumentParser.validate(command.args, this.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes)) {
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
}
