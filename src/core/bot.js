import CommandParser from "../commands/command-parser";
import CommandExecutionContext from "../commands/command-execution-context";
import ConsoleInterface from "../console/console-interface";
import EmojiMenuManager from "../emoji-ui/emoji-menu-manager";
import CommandManager from "../commands/command-manager";
import Utils from "./utils";
import EmojiCollection from "../collections/emoji-collection";
import Settings from "./settings";
import FeatureManager from "../features/feature-manager";
import CommandLoader from "../commands/command-loader";
import Log from "./log";
import Schema from "../schema/schema";
import DataStore from "../data-stores/data-store";

const Discord = require("discord.js");
const EventEmitter = require("events");
const fs = require("fs");

/**
 * @extends EventEmitter
 */
export default class Bot extends EventEmitter {
	/**
	 * @param {Object} data
	 */
	constructor(data) {
		super();

		// Setup the class
		this.setup(data);
	}

	/**
	 * Setup the bot from an object
	 * @param {Object} data
	 * @return {Promise}
	 */
	async setup(data) {
		// TODO: Should use the Typer library (Typer needs update)
		if (!Schema.validate(data, {
			"paths.settings": "string",
			"paths.emojis": "?string",
			"paths.commands": "string",
			"paths.authLevels": "string",
			argumentTypes: "object",
			dataAdapter: DataStore
		})) {
			Log.throw("[Bot.setup] Invalid data provided.");
		}

		/**
		 * @type {Settings}
		 * @readonly
		 */
		this.settings = new Settings(data.paths.settings);

		/**
		 * @type {DataStore}
		 * @readonly
		 */
		this.dataAdapter = data.dataAdapter;

		/**
		 * @type {(EmojiCollection|Null)}
		 * @readonly
		 */
		this.emojis = data.paths.emojis ? EmojiCollection.fromFile(data.paths.emojis) : null;

		/**
		 * @type {Discord.Client}
		 * @readonly
		 */
		this.client = new Discord.Client();

		/**
		 * @type {CommandManager}
		 * @readonly
		 */
		this.commands = new CommandManager(this, data.paths.commands, data.paths.accessLevels, data.argumentTypes);

		/**
		 * @type {FeatureManager}
		 * @readonly
		 */
		this.features = new FeatureManager();

		/**
		 * @type {CommandLoader}
		 * @readonly
		 */
		this.commandLoader = new CommandLoader(this.commands);

		/**
		 * @type {ConsoleInterface}
		 * @readonly
		 */
		this.console = new ConsoleInterface();

		/**
		 * @type {EmojiMenuManager}
		 * @readonly
		 */
		this.menus = new EmojiMenuManager(this.client);

		/**
		 * @type {Log}
		 * @readonly
		 */
		this.log = new Log(this);

		// Setup the Discord client's events
		this.setupEvents();

		// Load commands
		await this.commandLoader.loadAll();
		Log.verbose("Bot setup completed");
	}

	/**
	 * Setup the client's events
	 */
	setupEvents() {
		// TODO: Find better position
		const resolvers = {
			user: (arg) => Utils.resolveId(arg),
			channel: (arg) => Utils.resolveId(arg),
			role: (arg) => Utils.resolveId(arg),
			state: (arg) => Utils.translateState(arg)
		};

		// Discord client events
		this.client.on("ready", () => {
			this.log.success("Ready");
			this.console.init(this);
		});

		this.client.on("message", async (message) => {
			if (!message.author.bot) {
				if (CommandParser.isValid(message.content, this.commands, this.settings.general.prefix)) {
					this.commands.handle(
						new CommandExecutionContext(
							message,
							CommandParser.resolveArguments(CommandParser.getArguments(message.content), this.commands.argumentTypes, resolvers),
							this,
							this.commands.getAuthority(message.guild.id, message.member.roles.array().map((role) => role.name), message.author.id),
							this.emojis
						),

						CommandParser.parse(
							message.content,
							this.commands,
							this.settings.general.prefix
						)
					);
				}
				else if (message.content === "?prefix") {
					console.log(this.settings.general);

					message.channel.send(`Command prefix: **${this.settings.general.prefix}**`);
				}
			}
		});
	}

	/**
	 * Connect the client
	 * @return {Promise}
	 */
	async connect() {
		this.log.verbose("Starting");
		await this.client.login(this.settings.general.token);
	}

	/**
	 * Restart the bot's client
	 * @return {Promise}
	 */
	async restart() {
		this.log.verbose("Restarting");

		// TODO: Actually reload all the features and commands
		// this.features.reloadAll(this);

		await this.disconnect();
		await this.connect();
	}

	/**
	 * Disconnect the client
	 * @return {Promise}
	 */
	async disconnect() {
		this.settings.save();
		await this.client.destroy();
		this.log.info("Disconnected");
	}

	/**
	 * Clear all the files inside the temp folder
	 * @return {Promise}
	 */
	static async clearTemp() {
		if (fs.existsSync("./temp")) {
			fs.readdir("./temp", (error, files) => {
				for (let i = 0; i < files.length; i++) {
					fs.unlink(`./temp/${files[i]}`);
				}
			});
		}
	}
}
