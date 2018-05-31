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
import DataStore from "../data-stores/data-store";
import CommandAuthStore from "../commands/command-auth-store";

const Discord = require("discord.js");
const Typer = require("@raxor1234/typer");
const EventEmitter = require("events");
const fs = require("fs");

/**
 * @extends EventEmitter
 */
export default class Bot extends EventEmitter {
    /**
     * Setup the bot from an object
     * @param {Object} data
     * @return {Promise<Bot>}
     */
    async setup(data) {
        Log.verbose("[Bot.setup] Validating data object");

        if (!Typer.validate({
            paths: "!object",
            authStore: ":authStore",
            dataStore: ":dataStore",
            argumentTypes: "object"
        }, data, {
            authStore: (val) => val instanceof CommandAuthStore,
            dataStore: (val) => val instanceof DataStore
        })) {
            Log.throw("[Bot.setup] Invalid data object provided");
        }
        else if (!Typer.validate({
            settings: "!string",
            commands: "!string",
            emojis: "string"
        }, data.paths)) {
            Log.throw("[Bot.setup] Invalid paths object");
        }

        /**
         * @type {Settings}
         * @readonly
         */
        this.settings = await new Settings(data.paths.settings).reload();

        /**
         * @type {DataStore}
         * @readonly
         */
        this.dataStore = data.dataStore;

        /**
         * @type {CommandAuthStore}
         * @readonly
         */
        this.authStore = data.authStore;

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
        this.commands = new CommandManager(this, data.paths.commands, this.authStore, data.argumentTypes ? data.argumentTypes : {});

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

        // Load commands
        await this.commandLoader.loadAll();

        // Setup the Discord client's events
        this.setupEvents();

        Log.success("[Bot.setup] Bot setup completed");

        return this;
    }

    /**
     * Setup the client's events
     */
    setupEvents() {
        // TODO: Find better position
        // TODO: Merge this resolvers with the (if provided) provided
        // ones by the user.
        const resolvers = {
            user: (arg) => Utils.resolveId(arg),
            channel: (arg) => Utils.resolveId(arg),
            role: (arg) => Utils.resolveId(arg),
            state: (arg) => Utils.translateState(arg)
        };

        // Discord client events
        this.client.on("ready", () => {
            if (!this.console.ready) {
                // Setup the console command interface
                this.console.setup(this);
            }

            // Setup the command auth store
            this.setupAuthStore();
            Log.info(`[Bot.setupEvents] Logged in as ${this.client.user.tag}`);
            Log.success("[Bot.setupEvents] Ready");
        });

        this.client.on("message", async (message) => {
            if (!message.author.bot) {
                if (CommandParser.isValid(message.content, this.commands, this.settings.general.prefix)) {
                    this.commands.handle(
                        new CommandExecutionContext({
                            message: message,
                            args: CommandParser.resolveArguments(CommandParser.getArguments(message.content), this.commands.argumentTypes, resolvers),
                            bot: this,

                            // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs
                            auth: message.guild ? this.authStore.getAuthority(message.guild.id, message.member.roles.array().map((role) => role.name), message.author.id) : null,
                            emojis: this.emojis
                        }),

                        CommandParser.parse(
                            message.content,
                            this.commands,
                            this.settings.general.prefix
                        )
                    );
                }
                else if (message.content === "?prefix") {
                    message.channel.send(`Command prefix: **${this.settings.general.prefix}**`);
                }
            }
        });
    }

    setupAuthStore() {
        const guilds = this.client.guilds.array();

        let entries = 0;

        for (let i = 0; i < guilds.length; i++) {
            if (!this.authStore.contains(guilds[i].id)) {
                this.authStore.create(guilds[i].id);
                entries++;
            }
        }

        if (entries > 0) {
            Log.success(`[Bot.setupAuthStore] Added a total of ${entries} new auth store entries`);
        }

        Log.success("[Bot.setupAuthStore] Auth store setup completed");
    }

    /**
     * Connect the client
     * @return {Promise}
     */
    async connect() {
        Log.verbose("[Bot.connect] Starting");
        await this.client.login(this.settings.general.token);
    }

    /**
     * Restart the bot's client
     * @todo Use the reload modules param
     * @param {Boolean} reloadModules Whether to reload all modules
     * @return {Promise}
     */
    async restart(reloadModules = true) {
        Log.verbose("[Bot.restart] Restarting");

        if (reloadModules) {
            // TODO: Actually reload all the features and commands
            // this.features.reloadAll(this);
            await this.commandLoader.loadAll();
        }

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
        Log.info("[Bot.disconnect] Disconnected");
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
