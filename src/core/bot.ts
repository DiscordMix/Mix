// Setup environment variables
require("dotenv").config();

import ConsoleInterface from "../console/console-interface";
import Settings from "./settings";
import Log from "./log";
import Temp from "./temp";
import {Client, Snowflake} from "discord.js";
import ServiceManager from "../services/service-manager";
import axios from "axios";
import {IArgumentResolver} from "../commands/command";
import CommandHandler from "../commands/command-handler";
import fs from "fs";
import path from "path";
import Language from "../language/language";
import Analytics from "./bot-analytics";
import {IDisposable} from "./helpers";
import ActionInterpreter from "../actions/action-interpreter";
import TaskManager from "../tasks/task-manager";
import {EventEmitter} from "events";
import Optimizer from "../optimization/optimizer";
import FragmentManager from "../fragments/fragment-manager";
import PathResolver from "./path-resolver";
import {ArgResolvers, DefaultBotOptions} from "./constants";
import Store from "../state/store";
import BotMessages from "./messages";
import {InternalCommand, IBotExtraOptions, BotState, IBotOptions, BotToken, BotEvent, IBot} from "./bot-extra";
import {Action} from "@atlas/automata";
import BotConnector from "./bot-connector";
import CommandRegistry from "../commands/command-registry";
import BotHandler from "./bot-handler";

// TODO: Should emit an event when state changes
/**
 * @extends EventEmitter
 */
export default class Bot<TState = any, TActionType = any> extends EventEmitter implements IBot<TState, TActionType> {
    /**
     * @type {Settings}
     * @readonly
     */
    public readonly settings: Settings;

    /**
     * Access the bot's temporary file storage.
     * @todo Temporary hard-coded user ID.
     */
    public readonly temp: Temp;

    /**
     * Provides management of services.
     */
    public readonly services: ServiceManager;

    /**
     * Command storage.
     */
    public readonly registry: CommandRegistry;

    /**
     * Intercepts and handles command executions.
     */
    public readonly commandHandler: CommandHandler;

    /**
     * Provides functionality for the CLI.
     */
    public readonly console: ConsoleInterface;

    /**
     * Whether the built-in prefix command should be used.
     */
    public readonly prefixCommand: boolean;

    /**
     * The internal commands to load.
     * @todo Even if it's not specified here, the throw command was loaded, verify that ONLY specific trivials can be loaded?
     */
    public readonly internalCommands: InternalCommand[];

    /**
     * The owner of the bot's snowflake ID.
     */
    public readonly owner?: Snowflake;

    /**
     * The extra provided bot options.
     */
    public readonly options: IBotExtraOptions;

    /**
     * Localization provider.
     */
    public readonly language?: Language;

    /**
     * List of custom argument resolvers.
     */
    public readonly argumentResolvers: IArgumentResolver[];

    /**
     * A list that keeps track of disposable objects and classes.
     */
    public readonly disposables: IDisposable[];

    /**
     * The independent action interpreter.
     */
    public readonly actionInterpreter: ActionInterpreter;

    /**
     * Task management class.
     */
    public readonly tasks: TaskManager;

    /**
     * A list of attached timeouts.
     */
    public readonly timeouts: NodeJS.Timeout[];

    /**
     * A list of attached intervals.
     */
    public readonly intervals: NodeJS.Timeout[];

    /**
     * The languages to be loaded and enabled for localization.
     */
    public readonly languages?: string[];

    /**
     * The current state of connection of the bot.
     */
    public readonly state: BotState;

    /**
     * Whether the bot is currently suspended.
     */
    public readonly suspended: boolean;

    /**
     * The internal Discord client.
     */
    public readonly client: Client;

    /**
     * Optimization engine for large bots.
     */
    public readonly optimizer: Optimizer;

    /**
     * Fragment management class.
     */
    public readonly fragments: FragmentManager;

    /**
     * Utility to resolve file and directory paths.
     */
    public readonly paths: PathResolver;

    /**
     * Stores immutable data and handles events.
     */
    public readonly store: Store<TState, TActionType>;

    /**
     * Used for measuring interaction with the bot.
     */
    public readonly analytics: Analytics;

    /**
     * Handles incoming messages and requests.
     */
    public readonly handle: BotHandler;

    /**
     * The start timestamp of the latest setup sequence.
     */
    protected setupStart: number = 0;

    /**
     * Handles the bot connection and setup sequence.
     */
    protected readonly connector: BotConnector;

    /**
     * @param {Partial<IBotOptions> | BotToken} botOptionsOrToken
     * @param {boolean} [testMode=false] Whether the bot is being used in testing. For internal use only.
     */
    public constructor(botOptionsOrToken: Partial<IBotOptions<TState>> | BotToken, testMode: boolean = false) {
        super();

        let options: Partial<IBotOptions<TState>> = typeof botOptionsOrToken === "object" && botOptionsOrToken !== null && !Array.isArray(botOptionsOrToken) ? Object.assign({}, botOptionsOrToken) : (typeof botOptionsOrToken === "string" ? {
            settings: new Settings({
                general: {
                    prefix: ["!"],
                    token: botOptionsOrToken
                }
            })
        } : undefined as any);

        // Special options for unit tests.
        if (testMode) {
            (options.options as any) = {
                ...options.options,
                asciiTitle: false,
                consoleInterface: false
            };

            (options.settings as any).paths = {
                commands: path.resolve(path.join(__dirname, "../", "test", "test-commands")),
                languages: path.resolve(path.join("src", "test", "test-languages")),
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

        this.store = new Store<TState, TActionType>(options.initialState, options.reducers);
        this.state = BotState.Disconnected;
        this.settings = options.settings;
        this.paths = new PathResolver(this.settings.paths);
        this.temp = new Temp();
        this.handle = new BotHandler(this);
        this.client = new Client();
        this.services = new ServiceManager(this);
        this.registry = new CommandRegistry(this);
        this.argumentResolvers = ArgResolvers;

        if (options.argumentResolvers) {
            this.argumentResolvers = [
                ...this.argumentResolvers,
                ...options.argumentResolvers
            ];
        }

        this.commandHandler = new CommandHandler({
            commandStore: this.registry,
            errorHandlers: [] // TODO: Is this like it was? Is it ok?
        });

        this.console = new ConsoleInterface();
        this.prefixCommand = options.prefixCommand || true;

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

        this.options = {
            ...DefaultBotOptions,
            ...options.options,
        };

        this.owner = options.owner;
        this.language = this.settings.paths.languages ? new Language(this.settings.paths.languages) : undefined;
        this.languages = options.languages;
        this.suspended = false;
        this.analytics = new Analytics();
        this.disposables = [];
        this.actionInterpreter = new ActionInterpreter(this);
        this.tasks = new TaskManager(this);
        this.timeouts = [];
        this.intervals = [];
        this.optimizer = new Optimizer(this);
        this.fragments = new FragmentManager(this);
        this.connector = new BotConnector(this);

        // Force-bind certain methods.
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);

        return this;
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
     * @param {boolean} suspended Whether to suspend the bot.
     * @return {this}
     */
    public setSuspended(suspended: boolean = true): this {
        if (this.state !== BotState.Connected) {
            return this;
        }
        else if (this.suspended !== suspended) {
            (this.suspended as any) = suspended;
            this.setState(this.suspended ? BotState.Suspended : BotState.Connected);
        }

        return this;
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
     * @return {boolean} Whether the interval was cleared.
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
     * @return {number} The amount of cleared intervals.
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
     * Connect the Discord client.
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
     * @todo "Multiple instances" upon restarts may be caused because of listeners not getting removed (and re-attached).
     * @todo Use the reload modules param.
     * Restart the Discord client.
     * @param {boolean} [reloadModules=true] Whether to reload all modules.
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
     * Disconnect the Discord client.
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

        // Reset the temp folder before shutdown.
        await this.temp.reset();

        this.clearAllTimeouts();
        this.clearAllIntervals();
        await this.registry.disposeAll();
        await this.services.disposeAll();
        await this.services.stopAllForks();
        this.clearTemp();
    }

    /**
     * @param {BotState} state
     * @return {this}
     */
    public setState(state: BotState): this {
        (this.state as any) = state;

        return this;
    }
}
