import CommandParser from "../commands/command-parser";
import CommandExecutionContext from "../commands/command-execution-context";
import ConsoleInterface from "../console/console-interface";
import EmojiMenuManager from "../emoji-ui/emoji-menu-manager";
import CommandManager from "../commands/command-manager";
import Utils from "./utils";
import EmojiCollection from "../collections/emoji-collection";
import Settings from "./settings";
import UserConfig from "./user-config";
import FeatureManager from "../features/feature-manager";
import CommandLoader from "../commands/command-loader";
import Log from "./log";

const Discord = require("discord.js");
const EventEmitter = require("events");
const fs = require("fs");

export default class Bot extends EventEmitter {
	/**
	 * @param {Object} data
	 */
	constructor(data) {
		super();

		// Setup the class
		this.setup(data);

		// Discord client events
		this.client.on("ready", () => {
			this.log.info("Ready");
			this.console.init(this);
		});
	}

	setup(data) {
		/**
		 * @type {Settings}
		 */
		this.settings = new Settings(data.paths.settings);

		/**
		 * @type {EmojiCollection}
		 */
		this.emojis = EmojiCollection.fromFile(data.paths.emojis);

		/**
		 * @type {UserConfig}
		 */
		this.userConfig = new UserConfig(data.paths.userConfig);

		/**
		 * @type {Discord.Client}
		 */
		this.client = new Discord.Client();

		/**
		 * @type {CommandManager}
		 */
		this.commands = new CommandManager(this, data.paths.accessLevels);

		/**
		 * @type {FeatureManager}
		 */
		this.features = new FeatureManager();

		/**
		 * @type {CommandLoader}
		 */
		this.commandLoader = new CommandLoader(data.paths.commands);

		/**
		 * @type {ConsoleInterface}
		 */
		this.console = new ConsoleInterface();

		/**
		 * @type {EmojiMenuManager}
		 */
		this.menus = new EmojiMenuManager(this.client);

		/**
		 * @type {Log}
		 */
		this.log = new Log(this);

		/**
		 * Setup the Discord client's events
		 */
		this.setupEvents();
	}

	setupEvents() {
		// TODO: Find better position
		const resolvers = {
			user: (arg) => Utils.resolveId(arg),
			channel: (arg) => Utils.resolveId(arg),
			role: (arg) => Utils.resolveId(arg),
			state: (arg) => Utils.translateState(arg)
		};

		this.client.on("message", async (message) => {
			if (!message.author.bot) {
				if (CommandParser.isValid(message.content, this.commands, this.settings.general.commandTrigger)) {
					this.commands.handle(
						new CommandExecutionContext(
							message,
							CommandParser.resolveArguments(CommandParser.getArguments(message.content), CommandManager.getTypes(), resolvers),
							this,
							this.commands.getAuthority(message.guild.id, message.member.roles.array().map((role) => role.name), message.author.id),
							this.emojis
						),

						CommandParser.parse(
							message.content,
							this.commands,
							this.settings.general.commandTrigger
						)
					);
				}
				else if (message.content === "?trigger") {
					message.channel.send(`Command trigger: **${this.settings.general.commandTrigger}**`);
				}
			}
		});
	}

	connect() {
		this.log.info("Starting");
		this.client.login(this.settings.general.token);
	}

	restart() {
		this.log.info("Restarting");

		// TODO
		// this.features.reloadAll(this);

		this.disconnect();
		this.connect();
	}

	disconnect() {
		this.settings.save();
		this.client.destroy();
		this.log.info("Disconnected");
	}

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
