// Setup environment variables
require("dotenv").config();

import CommandParser from "../commands/command-parser";
import DiscordContext from "../commands/command-context";
import ConsoleInterface from "../console/console-interface";
import Util from "../core/util";
import DiscordSettings from "../universal/discord/discord-settings";
import Log from "../logging/log";
import Temp from "../core/temp";
import Discord, {Client, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import ServiceManager from "../services/service-manager";
import axios from "axios";

import Command, {
    IArgumentResolver,
    ICustomArgType,
    RawArguments,
    UserGroup
} from "../commands/command";

import CommandHandler from "../commands/command-handler";
import fs from "fs";
import path from "path";
import Language from "../language/language";
import StatCounter from "../core/stat-counter";
import {IDisposable} from "../core/helpers";
import ActionInterpreter from "../actions/action-interpreter";
import TaskManager from "../tasks/task-manager";
import {EventEmitter} from "events";
import Optimizer from "../optimization/optimizer";
import FragmentManager from "../fragments/fragment-manager";
import PathResolver from "../core/path-resolver";
import {ArgResolvers, ArgTypes, DefaultBotOptions} from "../core/constants";
import Store from "../state/store";
import BotMessages from "../core/messages";
import {InternalCommand, IBotExtraOptions, BotState, IBotOptions, DiscordBotToken, BotEvent} from "../core/bot-extra";
import {Action} from "@atlas/automata";
import BotConnector from "../core/bot-connector";
import CommandRegistry from "../commands/command-store";
import DiscordClient from "../universal/discord/discord-client";
import {IDiscordBotOpts, IDiscordBot} from "../universal/discord/discord-bot";

// TODO: Should emit an event when state changes
/**
 * @extends EventEmitter
 */
export default class DiscordBot<TState = any, TActionType = any> extends EventEmitter implements IDiscordBot<TState, TActionType> {
    public readonly settings: DiscordSettings;
    public readonly temp: Temp;
    public readonly services: ServiceManager;
    public readonly registry: CommandRegistry;
    public readonly commandHandler: CommandHandler;
    public readonly console: ConsoleInterface;
    public readonly prefixCommand: boolean;
    public readonly internalCommands: InternalCommand[];
    public readonly userGroups: UserGroup[];
    public readonly owner?: Snowflake;
    public readonly options: IBotExtraOptions;
    public readonly language?: Language;
    public readonly argumentResolvers: IArgumentResolver[];
    public readonly argumentTypes: ICustomArgType[];
    public readonly disposables: IDisposable[];
    public readonly actionInterpreter: ActionInterpreter;
    public readonly tasks: TaskManager;
    public readonly timeouts: NodeJS.Timeout[];
    public readonly intervals: NodeJS.Timeout[];
    public readonly languages?: string[];
    public readonly state: BotState;
    public readonly suspended: boolean;
    public readonly client: DiscordClient;
    public readonly optimizer: Optimizer;
    public readonly fragments: FragmentManager;
    public readonly paths: PathResolver;
    public readonly store: Store<TState, TActionType>;

    protected setupStart: number = 0;

    // TODO: Implement stat counter
    protected readonly statCounter: StatCounter;

    protected readonly connector: BotConnector;

    /**
     * Setup the bot from an object
     * @param {Partial<IDiscordBotOpts<TState>> | DiscordBotToken} botOptionsOrToken
     * @param {boolean} [testMode=false]
     */
    public constructor(botOptionsOrToken: Partial<IDiscordBotOpts<TState>> | DiscordBotToken, testMode: boolean = false) {
        super();

        let options: Partial<IBotOptions<TState>> = typeof botOptionsOrToken === "object" && botOptionsOrToken !== null && !Array.isArray(botOptionsOrToken) ? Object.assign({}, botOptionsOrToken) : (typeof botOptionsOrToken === "string" ? {
            settings: new DiscordSettings({
                general: {
                    prefix: ["!"],
                    token: botOptionsOrToken
                }
            })
        } : undefined as any);

        // Special options for unit tests
        if (testMode) {
            (options.options as any) = {
                ...options.options,
                asciiTitle: false,
                consoleInterface: false
            };

            (options.settings as any).paths = {
                commands: path.resolve(path.join(__dirname, "../", "test", "test-commands")),
                emojis: path.resolve(path.join(__dirname, "../", "test", "test-emojis")),
                languages: path.resolve(path.join("src", "test", "test-languages")),
                plugins: path.resolve(path.join(__dirname, "../", "test", "test-plugins")),
                services: path.resolve(path.join(__dirname, "../", "test", "test-services")),
                tasks: path.resolve(path.join(__dirname, "../", "test", "test-tasks")),
            };

            options = {
                ...options,
                internalCommands: [InternalCommand.Help, InternalCommand.Usage, InternalCommand.Ping],
                languages: ["test-language"],
            };
        }

        if (!options || !options.settings || typeof options.settings !== "object") {
            throw Log.error(BotMessages.SETUP_INVALID);
        }

        /**
         * Stores immutable data and handles events.
         * @type {Store}
         * @readonly
         */
        this.store = new Store<TState, TActionType>(options.initialState, options.reducers);

        /**
         * The current state of connection of the bot.
         * @type {BotState}
         * @readonly
         */
        this.state = BotState.Disconnected;

        /**
         * @type {DiscordSettings}
         * @readonly
         */
        this.settings = options.settings;

        /**
         * Utility to resolve file and directory paths.
         * @type {PathResolver}
         * @readonly
         */
        this.paths = new PathResolver(this.settings.paths);

        /**
         * Access the bot's temporary file storage.
         * @todo Temporary hard-coded user ID.
         * @type {Temp}
         * @readonly
         */
        this.temp = new Temp();

        /**
         * @type {Discord.Client}
         * @readonly
         */
        this.client = new Discord.Client();

        /**
         * Provides management of services.
         * @type {ServiceManager}
         * @readonly
         */
        this.services = new ServiceManager(this);

        /**
         * Command storage.
         * @type {CommandRegistry}
         * @readonly
         */
        this.registry = new CommandRegistry(this);

        /**
         * @type {IArgumentResolver[]}
         * @readonly
         */
        this.argumentResolvers = ArgResolvers;

        if (options.argumentResolvers) {
            this.argumentResolvers = [
                ...this.argumentResolvers,
                ...options.argumentResolvers
            ];
        }

        /**
         * @type {ICustomArgType[]}
         * @readonly
         */
        this.argumentTypes = ArgTypes;

        if (options.argumentTypes) {
            this.argumentTypes = [
                ...this.argumentTypes,
                ...options.argumentTypes
            ];
        }

        /**
         * Intercepts and handles command executions.
         * @type {CommandHandler}
         * @readonly
         */
        this.commandHandler = new CommandHandler({
            registry: this.registry,
            errorHandlers: [], // TODO: Is this like it was? Is it ok?
            argumentTypes: this.argumentTypes
        });

        /**
         * Provides functionality for CLI input.
         * @type {ConsoleInterface}
         * @readonly
         */
        this.console = new ConsoleInterface();

        /**
         * Whether the built-in prefix command should be used.
         * @type {boolean}
         * @readonly
         */
        this.prefixCommand = options.prefixCommand || true;

        /**
         * The internal commands to load.
         * @todo Even if it's not specified here, the throw command was loaded, verify that ONLY specific trivials can be loaded?
         * @type {InternalCommand[]}
         * @readonly
         */
        this.internalCommands = options.internalCommands || [
            InternalCommand.CLI,
            InternalCommand.Eval,
            InternalCommand.Help,
            InternalCommand.Ping,
            InternalCommand.Prefix,
            InternalCommand.Reflect,
            InternalCommand.Restart,
            InternalCommand.Throw,
            InternalCommand.Usage
        ];

        /**
         * @type {IBotExtraOptions}
         * @readonly
         */
        this.options = {
            ...DefaultBotOptions,
            ...options.options,
        };

        // TODO: Make use of the userGroups property
        /**
         * @type {UserGroup[]}
         * @readonly
         */
        this.userGroups = options.userGroups || [];

        /**
         * The owner of the bot's snowflake ID.
         * @type {Snowflake | undefined}
         * @readonly
         */
        this.owner = options.owner;

        /**
         * Localization provider.
         * @type {Language | undefined}
         * @readonly
         */
        this.language = this.settings.paths.languages ? new Language(this.settings.paths.languages) : undefined;

        /**
         * The languages to be loaded and enabled for localization.
         * @type {string[] | undefined}
         * @readonly
         */
        this.languages = options.languages;

        /**
         * Whether the bot is currently suspended.
         * @type {boolean}
         */
        this.suspended = false;

        /**
         * Used for measuring interaction with the bot.
         * @type {StatCounter}
         */
        this.statCounter = new StatCounter();

        /**
         * A list that keeps track of disposable objects and classes.
         * @type {IDisposable[]}
         * @protected
         * @readonly
         */
        this.disposables = [];

        /**
         * @type {ActionInterpreter}
         * @readonly
         */
        this.actionInterpreter = new ActionInterpreter(this);

        /**
         * Task management class.
         * @type {TaskManager}
         * @readonly
         */
        this.tasks = new TaskManager(this);

        /**
         * A list of attached timeouts.
         * @type {NodeJS.Timeout[]}
         * @readonly
         */
        this.timeouts = [];

        /**
         * A list of attached intervals.
         * @type {NodeJS.Timeout[]}
         * @readonly
         */
        this.intervals = [];

        /**
         * Optimization engine for large bots.
         * @type {Optimizer}
         * @readonly
         */
        this.optimizer = new Optimizer(this);

        /**
         * Fragment management class.
         * @type {FragmentManager}
         * @readonly
         */
        this.fragments = new FragmentManager(this);

        /**
         * Handles bot connection and setup sequence.
         * @type {BotConnector}
         * @readonly
         */
        this.connector = new BotConnector(this);

        // Force-bind certain methods
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
    }

    /**
     * Whether the bot is currently connected.
     * @return {boolean}
     */
    public get connected(): boolean {
        return this.state === BotState.Connected;
    }

    /**
     * Post stats to various bot lists.
     */
    public async postStats(): Promise<void> {
        if (!this.client.user || Object.keys(this.settings.keys).length === 0) {
            return;
        }

        const serverCoun: number = this.client.guilds.size;

        // Discord Bot List.org
        if (this.settings.keys.dbl) {
            const dblUrl: string = "https://discordbots.org/api/bots/{botId}/stats";

            await axios.post(dblUrl.replace("{botId}", this.client.user.id), {
                server_count: serverCoun
            }, {
                    headers: {
                        Authorization: this.settings.keys.dbl
                    }
                }).catch((error: Error) => {
                    Log.warn(`Could not post stats to discordbots.org (${error.message})`);
                });
        }

        // Bots for Discord.com
        if (this.settings.keys.bfd) {
            const bfdUrl: string = "https://botsfordiscord.com/api/bot/{botId}";

            await axios.post(bfdUrl.replace("{botId}", this.client.user.id), {
                server_count: serverCoun
            }, {
                    headers: {
                        Authorization: this.settings.keys.bfd,
                        "Content-Type": "application/json"
                    }
                }).catch((error: Error) => {
                    Log.warn(`Could not post stats to botsfordiscord.com (${error.message})`);
                });
        }
    }

    /**
     * Suspend or unsuspend the bot.
     * @param {boolean} suspend Whether to suspend the bot.
     * @return {this}
     */
    public suspend(suspend: boolean = true): this {
        if (this.state !== BotState.Connected) {
            return this;
        }
        else if (this.suspended !== suspend) {
            (this.suspended as any) = suspend;
            this.setState(this.suspended ? BotState.Suspended : BotState.Connected);
        }

        return this;
    }

    /**
     * Emulate a command invocation.
     * @todo 'args' type on docs (here)
     * @param {string} base The base command name.
     * @param {Message} referer The triggering message.
     * @param {string[]} args
     * @return {Promise<*>}
     */
    public async invokeCommand(base: string, referer: Message, ...args: string[]): Promise<any> {
        // Use any registered prefix, default to index 0
        const content: string = `${this.settings.general.prefix[0]}${base} ${args.join(" ")}`.trim();

        let command: Command | null = await CommandParser.parse(
            content,
            this.registry,
            this.settings.general.prefix
        );

        if (command === null) {
            throw Log.error(BotMessages.CMD_PARSE_FAIL);
        }

        command = command as Command;

        const rawArgs: RawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content, command.args),
            command,
            schema: command.args,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun
            message: referer
        });

        // TODO: Debugging
        // Log.debug("raw args, ", rawArgs);

        return this.commandHandler.handle(
            this.createCommandContext(referer),
            command,
            rawArgs
        );
    }

    /**
     * Attach a timeout to the bot.
     * @param {Action} action
     * @param {number} time
     * @return {NodeJS.Timeout}
     */
    public setTimeout(action: Action, time: number): NodeJS.Timeout {
        const timeout: NodeJS.Timeout = setTimeout(() => {
            action();
            this.clearTimeout(timeout);
        }, time);

        this.timeouts.push(timeout);

        return timeout;
    }

    /**
     * Clear an attached timeout.
     * @param {NodeJS.Timeout} timeout
     * @return {boolean} Whether the timeout was cleared.
     */
    public clearTimeout(timeout: NodeJS.Timeout): boolean {
        const index: number = this.timeouts.indexOf(timeout);

        if (index !== -1) {
            clearTimeout(this.timeouts[index]);
            this.timeouts.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * Clear all attached timeouts.
     * @return {number} The amount of timeouts cleared.
     */
    public clearAllTimeouts(): number {
        let cleared: number = 0;

        for (const timeout of this.timeouts) {
            if (this.clearTimeout(timeout)) {
                cleared++;
            }
        }

        return cleared;
    }

    /**
     * Attach an interval to the bot.
     * @param {Action} action The callback method to invoke.
     * @param {number} time
     */
    public setInterval(action: any, time: number): NodeJS.Timeout {
        const interval: any = setInterval(action, time);

        this.intervals.push(interval);

        return interval;
    }

    /**
     * Clear an attached interval.
     * @param {NodeJS.Timeout} interval
     * @return {boolean} Whether the interval was cleared
     */
    public clearInterval(interval: NodeJS.Timeout): boolean {
        const index: number = this.timeouts.indexOf(interval);

        if (index !== -1) {
            clearTimeout(this.intervals[index]);
            this.intervals.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * Clear all attached intervals.
     * @return {number} The amount of cleared intervals
     */
    public clearAllIntervals(): number {
        let cleared: number = 0;

        for (const interval of this.intervals) {
            if (this.clearInterval(interval)) {
                cleared++;
            }
        }

        return cleared;
    }

    /**
     * Handle an incoming message.
     * @param {Message} msg The incoming message.
     * @param {boolean} [edited=false] Whether the message was previously edited.
     * @return {Promise<boolean>}
     */
    public async handleMessage(msg: Message, edited: boolean = false): Promise<boolean> {
        if (Util.isEmpty(msg) || typeof msg !== "object" || !(msg instanceof Message) || Array.isArray(msg)) {
            return false;
        }

        this.statCounter.stats.messagesSeen++;

        if (this.suspended) {
            return false;
        }

        this.emit(BotEvent.HandleMessageStart);

        if (this.options.logMessages) {
            const names: any = {};

            if (msg.channel.type === "text" && msg.guild !== undefined) {
                names.guild = msg.guild.name;
                names.channel = ` # ${(msg.channel as TextChannel).name}`;
            }
            else if (msg.channel.type === "dm" && msg.guild === undefined) {
                names.guild = "";
                names.channel = "Direct Messages";
            }
            else {
                names.guild = "Unknown";
                names.channel = " # Unknown";
            }

            Log.info(`[${msg.author.tag} @ ${names.guild}${names.channel}] ${Util.cleanMessage(msg)}${edited ? " [Edited]" : ""}`);
        }

        // TODO: Cannot do .startsWith with a prefix array
        if ((!msg.author.bot || (msg.author.bot && !this.options.ignoreBots)) /*&& message.content.startsWith(this.settings.general.prefix)*/ && CommandParser.validate(msg.content, this.registry, this.settings.general.prefix)) {
            if (this.options.allowCommandChain) {
                // TODO: Might split values too
                const rawChain: string[] = msg.content.split("~");

                // TODO: Should be bot option
                const maxChainLength: number = 5;

                let allowed: boolean = true;

                if (rawChain.length > maxChainLength) {
                    allowed = false;
                    msg.reply(`Maximum allowed chain length is ${maxChainLength} commands. Your commands were not executed.`);
                }

                if (allowed) {
                    const chain: string[] = rawChain.slice(0, maxChainLength);

                    // TODO: What if commandChecks is start and the bot tries to react twice or more?
                    for (const chainItem of chain) {
                        await this.handleCommandMessage(msg, chainItem.trim(), this.argumentResolvers);
                    }
                }
            }
            else {
                await this.handleCommandMessage(msg, msg.content, this.argumentResolvers);
            }
        }
        // TODO: ?prefix should also be chain-able
        else if (!msg.author.bot && msg.content === "?prefix" && this.prefixCommand) {
            await msg.channel.send(new RichEmbed()
                .setDescription(`Command prefix(es): **${this.settings.general.prefix.join(", ")}** | Powered by [The Mix Framework](https://github.com/discord-mix/mix)`)
                .setColor("GREEN"));
        }
        // TODO: There should be an option to disable this
        // TODO: Use embeds
        // TODO: Verify that it was done in the same environment and that the user still has perms
        else if (!msg.author.bot && msg.content === "?undo") {
            if (!this.commandHandler.undoMemory.has(msg.author.id)) {
                await msg.reply(BotMessages.UNDO_NO_ACTIONS);
            }
            else if (this.commandHandler.undoAction(msg.author.id, msg)) {
                await msg.reply(BotMessages.UNDO_OK);
                this.commandHandler.undoMemory.delete(msg.author.id);
            }
            else {
                await msg.reply(BotMessages.UNDO_FAIL);
            }
        }

        this.emit(BotEvent.HandleMessageEnd);

        return true;
    }

    /**
     * @todo Investigate the resolvers parameter usage (is it even used or required?)
     * @param {Message} message
     * @param {string} content
     * @param {*} resolvers
     * @return {Promise<void>}
     */
    public async handleCommandMessage(message: Message, content: string, resolvers: any): Promise<void> {
        this.emit(BotEvent.HandleCommandMessageStart, message, content);

        const command: Command | null = await CommandParser.parse(
            content,
            this.registry,
            this.settings.general.prefix
        );

        if (command === null) {
            throw Log.error(BotMessages.CMD_PARSE_FAIL);
        }

        const rawArgs: RawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content, command.args),
            command,
            schema: command.args,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun
            message
        });

        // TODO: Debugging
        Log.debug("Raw arguments are", rawArgs);

        await this.commandHandler.handle(
            this.createCommandContext(message),
            command,
            rawArgs
        );

        this.emit(BotEvent.HandleCommandMessageEnd, message, content);
    }

    /**
     * Connect the client.
     * @return {Promise<this>}
     */
    public async connect(): Promise<this> {
        this.setState(BotState.Connecting);
        await this.connector.setup();
        Log.verbose("Starting");

        await this.client.login(this.settings.general.token).catch(async (error: Error) => {
            if (error.message === "Incorrect login details were provided.") {
                Log.error("The provided token is invalid or has been regenerated");
                await this.disconnect();
                process.exit(0);
            }
            else {
                throw error;
            }
        });

        return this;
    }

    /**
     * @todo "Multiple instances" upon restarts may be caused because of listeners not getting removed (and re-attached)
     * @todo Use the reload modules param
     * Restart the client.
     * @param {boolean} [reloadModules=true] Whether to reload all modules
     * @return {Promise<this>}
     */
    public async restart(reloadModules: boolean = true): Promise<this> {
        this.emit(BotEvent.Restarting, reloadModules);
        Log.verbose("Restarting");

        // Dispose resources
        await this.dispose();

        // Disconnect the bot
        await this.disconnect();

        if (reloadModules) {
            const commands: number = this.registry.getAll().size;

            Log.verbose(`Reloading ${commands} command(s)`);

            const reloaded: number = await this.registry.reloadAll();

            Log.success(`Reloaded ${reloaded}/${commands} command(s)`);
        }

        await this.connect();
        this.emit(BotEvent.Restarted, reloadModules);

        return this;
    }

    /**
     * Disconnect the client.
     * @return {Promise<this>}
     */
    public async disconnect(): Promise<this> {
        this.emit(BotEvent.Disconnecting);

        const servicesStopped: number = this.services.size;

        await this.services.stopAll();
        Log.verbose(`Stopped ${servicesStopped} service(s)`);
        await this.dispose();
        await this.client.destroy();
        (this.client as any) = new Client();
        Log.info("Disconnected");
        this.emit(BotEvent.Disconnected);

        return this;
    }

    /**
     * Clear all the files inside the temp folder.
     */
    public clearTemp(): void {
        this.emit(BotEvent.ClearingTemp);

        // TODO: Path may need to be resolved/maybe it wont be relative...
        if (fs.existsSync("./temp")) {
            fs.readdir("./temp", (error: any, files: any) => {
                for (const file of files) {
                    fs.unlink(`./temp/${file}`, (fileError: Error) => {
                        throw fileError;
                    });
                }
            });
        }

        this.emit(BotEvent.ClearedTemp);
    }

    /**
     * Dispose the bot's resources, attached timeouts and intervals.
     */
    public async dispose(): Promise<void> {
        for (const disposable of this.disposables) {
            await disposable.dispose();
        }

        // Reset the temp folder before shutdown
        await this.temp.reset();

        this.clearAllTimeouts();
        this.clearAllIntervals();
        await this.registry.disposeAll();
        await this.services.disposeAll();
        await this.services.stopAllForks();
        this.clearTemp();
    }

    public setState(state: BotState): this {
        (this.state as any) = state;

        return this;
    }

    /**
     * Create a linked command context instance.
     * @param {Message} msg
     * @return {DiscordContext}
     */
    protected createCommandContext(msg: Message): DiscordContext {
        return new DiscordContext({
            bot: this,
            msg,
            // args: CommandParser.resolveArguments(CommandParser.getArguments(content), this.commandHandler.argumentTypes, resolvers, message),

            // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review)

            label: CommandParser.getCommandBase(msg.content, this.settings.general.prefix)
        });
    }
}
