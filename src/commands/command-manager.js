import AccessLevelType from "../commands/access-level-type";
import CommandExecutedEvent from "../events/command-executed-event";
import CommandCategoryType from "./command-category-type";
import Log from "../core/log";

const Typer = require("@raxor1234/typer/typer");
// import Collection from "../core/collection";

export default class CommandManager /* extends Collection */ {
	/**
	 * @param {Bot} bot
	 * @param {String} path
	 * @param {CommandAuthStore} authStore
	 * @param {Object} argumentTypes
	 */
	constructor(bot, path, authStore, argumentTypes) {
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
		this.path = path;

		/**
		 * @type {CommandAuthStore}
		 * @private
		 * @readonly
		 */
		this.authStore = authStore;

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
		return this.remove(this.getByName(commandBase));
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
		return this.getByName(commandBase) !== null;
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
		return this.getByName(commandBase) != null;
	}

	/**
	 * @param {String} name
	 * @returns {(Command|Null)}
	 */
	getByName(name) {
		for (let i = 0; i < this.commands.length; i++) {
			if (this.commands[i].name === name || this.commands[i].aliases.includes(name)) {
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
			Log.debug("AssembleArguments: Not same length");
		}

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
			context.fail(":underage: Please use a NSFW channel for this command.");
		}
		else if (!command.isEnabled) {
			await context.fail("That command is disabled and may not be used.");
		}
		else if (!this.authStore.hasAuthority(context.message.guild.id, context.message, command.authLevel)) {
			// TODO: New AuthStore system
			const minAuthority = AccessLevelType.toString(command.authLevel);

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
		else if (command.canExecute !== null && !command.canExecute(context)) {
			context.fail("That command cannot be executed right now.");
		}
		else if (!Typer.validate(command.args, this.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes)) {
			await context.fail("Invalid argument usage. Please use the `usage` command.");
		}
		else {
			try {
				const result = command.executed(context);
				context.bot.emit("commandExecuted", new CommandExecutedEvent(command, context));

				return result;
			}
			catch (error) {
				// TODO: Include stack trace
				Log.error(`There was an error while executing the ${command.name} command: ${error.message}`);
				context.fail(`There was an error executing that command. (${error.message})`);
			}
		}

		return false;
	}
}
