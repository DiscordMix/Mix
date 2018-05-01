import CommandParser from "../commands/command-parser";
import Log from "./log";
import CommandExecutionContext from "../commands/command-execution-context";
import Database from "../database/database";
import ConsoleInterface from "../console/console-interface";
import EmojiMenuManager from "../emoji-ui/emoji-menu-manager";
import EmbedBuilder from "./embed-builder";
import CommandManager from "../commands/command-manager";
import Utils from "./utils";
import EmojiCollection from "./emoji-collection";

const DBL = require("dblapi.js");
const snekfetch = require("snekfetch");
const Discord = require("discord.js");
const EventEmitter = require("events");
const fs = require("fs");

export default class Bot {
	/**
	 * @param {Settings} settings
	 * @param {String} emojisPath
	 * @param {UserConfig} userConfig
	 * @param {Discord.Client} client
	 * @param {string} accessLevelsPath
	 * @param {FeatureManager} featureManager
	 * @param {CommandLoader} commandLoader
	 */
	constructor(settings, emojisPath, userConfig, client, accessLevelsPath, featureManager, commandLoader, debug, verbose) {
		/**
		 * @type {module:events.internal}
		 * @private
		 */
		this.events = new EventEmitter();

		/**
		 * @type {Settings}
		 */
		this.settings = settings;

		/**
		 * @type {EmojiCollection}
		 */
		this.ec = EmojiCollection.fromFile(emojisPath);

		/**
		 * @type {UserConfig}
		 */
		this.userConfig = userConfig;

		/**
		 * @type {Discord.Client}
		 */
		this.client = client;

		/**
		 * @type {CommandManager}
		 */
		this.commands = new CommandManager(this, accessLevelsPath);

		/**
		 * @type {FeatureManager}
		 */
		this.features = featureManager;

		/**
		 * @type {CommandLoader}
		 */
		this.commandLoader = commandLoader;

		/**
		 * @type {Database}
		 */
		this.database = new Database(this.settings.general.databasePath);

		/**
		 * @type {ConsoleInterface}
		 */
		this.console = new ConsoleInterface();

		/**
		 * @type {EmojiMenuManager}
		 */
		this.emojis = new EmojiMenuManager(this.client);

		/**
		 * @type {Log}
		 */
		this.log = new Log(this, debug, verbose);

		// TODO
		if (settings.keys.dbl) {
			/**
			 * @type {DBLAPI}
			 */
			this.dbl = new DBL(settings.keys.dbl);
		}

		// TODO: Move from here on to the connect function
		// and make sure there aren't any errors on restart

		// Discord client events
		this.client.on("ready", () => {
			this.log.info("Ready");

			this.client.user.setPresence({
				game: {
					name: `Use ?trigger | ${this.client.guilds.size} guilds!`
				}
			});

			// Check for missing guilds in user config
			const guilds = this.client.guilds.array();

			for (let i = 0; i < guilds.length; i++) {
				if (!this.userConfig.contains(guilds[i].id)) {
					this.userConfig.createGuild(guilds[i].id);
				}
			}

			this.userConfig.save();

			this.postStats();
			this.console.init(this);
		});

		// TODO: Find better position
		const resolvers = {
			user: (arg) => Utils.resolveId(arg),
			channel: (arg) => Utils.resolveId(arg),
			role: (arg) => Utils.resolveId(arg),
			state: (arg) => Utils.translateState(arg)
		};

		this.userMessagePoints = {};
		setInterval(() => {
			this.userMessagePoints = {};
		}, 60000);
		this.client.on("message", async (message) => {
			if (!message.author.bot) {
				this.log.verbose(`MSG ${message.channel.id}-${message.id} FROM ${message.author.id}`);
				// TODO: Position so only given to command uses, and position it after command executed to avoid blocking
				if (this.userMessagePoints[message.author.id] === undefined) {
					this.userMessagePoints[message.author.id] = 0;
				}
				if (this.userMessagePoints[message.author.id] < 18) {
					await this.database.addUserPoints(message.author.id, 1);
					this.log.debug(`Gave point`);
				}
				this.userMessagePoints[message.author.id] += 1;
				this.log.debug(`User messages: ${this.userMessagePoints[message.author.id]}`);
				this.events.emit("userMessage", message);

				if (message.mentions.users.size > 0) {
					for (let i = 0; i < message.mentions.users.size && i <= 5; i++) {
						const user = message.mentions.users.array()[i];
						const dbUser = await this.database.getUser(user.id);
						const member = message.guild.member(user.id);

						if (member && member.presence.status === "idle") {
							if (dbUser.afkMessage !== "" && dbUser.afkMessage !== null && dbUser.afkMessage !== undefined) {
								message.channel.send(`**${user.username}** is afk; ${dbUser.afkMessage}`);
							}
						}
					}
				}

				if (global.trivAns) {
					if (message.channel.id === global.trivAns.channel.id && message.content.toLowerCase() === global.trivAns.answer) {
						this.database.addUserPoints(message.author.id, 5);
						message.channel.send(`**${message.author.username}** answered correctly! The answer is **${global.trivAns.answer}**. You won **+5** coins!`);
						global.trivAns = null;
					}
				}

				if (CommandParser.isValid(message.content, this.commands, this.settings.general.commandTrigger)) {
					this.commands.handle(
						new CommandExecutionContext(
							message,
							CommandParser.resolveArguments(CommandParser.getArguments(message.content), CommandManager.getTypes(), resolvers),
							this,
							this.commands.getAuthority(message.guild.id, message.member.roles.array().map((role) => role.name), message.author.id),
							this.ec
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

			if (this.userConfig.get("global.log")) {
				this.database.addMessage(message);
			}
		});

		this.client.on("guildCreate", (guild) => {
			this.postStats();
			this.userConfig.createGuild(guild.id);

			this.log.channel(new EmbedBuilder()
				.color("GREEN")
				.title("Joined Guild")
				.field("Name", guild.name)
				.field("Members", guild.memberCount)
				.field("Owner", guild.owner.user.toString())
				.thumbnail(guild.iconURL)
				.build());

			// TODO: This should only happen when the bot is given
			// ADMIN permissions right from the invitation. Make a way
			// to activate and deactivate this every time the bot gets
			// or loses ADMIN permissions.
			if (guild.me.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
				if (guild.owner) {
					this.userConfig.push("access-levels.owner", guild.owner.id, guild.id);

					// TODO: Temporally disabled due to maybe being "annoying", only shot
					// on those servers who actually invite Tux as admin.
					const send = (channel) => {
						return;

						channel.send(`<@${guild.owner.id}>`);

						channel.send(new EmbedBuilder()
							.color("GREEN")
							.text(`Hey, I'm Tux! Thanks for inviting me to your server! The \`Owner\` access level has been automatically granted to the owner of this guild (**${guild.owner.user.tag}**). You may assign administrators and/or moderators using the \`assign\` command. If you need any help with Tux, refer to the \`support\` command.`)
							.title("Thanks for inviting Tux!")
							.build());
					};

					if (guild.defaultChannel) {
						send(guild.defaultChannel);
					}
					else {
						const channels = guild.channels.array().filter((channel) => channel.type === "text");

						for (let i = 0; i < channels.length; i++) {
							if (channels[i].permissionsFor(guild.member(this.client.user.id)).has(Discord.Permissions.FLAGS.SEND_MESSAGES)) {
								send(channels[i]);

								break;
							}
						}
					}
				}
				else {
					// TODO: Default to admins
				}
			}
		});

		this.client.on("guildDelete", (guild) => {
			this.postStats();
			this.userConfig.removeGuild(guild.id);

			this.log.channel(new EmbedBuilder()
				.color("RED")
				.title('Left guild')
				.field('Name', guild.name)
				.field('Members', guild.memberCount)
				.field('Owner', guild.owner.user.toString())
				.thumbnail(guild.iconURL)
				.build());
		});

		global.b = this;

		// TODO: DEBUG -----------------------
		this.events.on("commandExecuted", (e) => this.log.info(`${e.context.sender.username}@${e.context.message.guild.name}: ${e.context.message.content}`));
		// -----------------------------------
	}

	postStats() {
		const amount = this.client.guilds.size;

		// Discord Bot List (DBL)
		if (this.dbl) {
			setInterval(() => {
				this.dbl.postStats(amount);
			}, 1800000);
		}

		// Bots for Discord (BFD)
		if (this.settings.keys.bfd) {
			setInterval(() => {
				snekfetch.post(`https://botsfordiscord.com/api/v1/bots/${this.client.user.id}`)
					.set("Authorization", this.settings.keys.bfd)
					.set("Content-Type", "application/json")
					.send({
						count: amount
					})
					.catch((error) => this.log.error(`The error was posting stats to BFD: ${error.message}`));
			}, 3600000);
		}
	}

	connect() {
		this.log.info('Starting');
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
		// TODO: Actually logout the bot
		// this.client.disconnect();
		this.settings.save();
		this.userConfig.save();
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
