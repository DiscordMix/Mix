// Load and apply environment variables.
require("dotenv").config();

import ConsoleInterface from "../console/ConsoleInterface";
import Log from "./Log";
import Temp from "./Temp";
import {Client, Snowflake} from "discord.js";
import ServiceManager from "../services/service-manager";
import axios from "axios";
import CommandHandler from "../commands/CommandHandler";
import fs from "fs";
import path from "path";
import Translation from "../Language/Language";
import Analytics from "./BotAnalytics";
import {IDisposable} from "./Helpers";
import TaskManager from "../Tasks/TaskManager";
import {EventEmitter} from "events";
import Optimizer from "../Optimization/Optimizer";
import FragmentManager from "../Fragments/FragmentManager";
import PathResolver from "./PathResolver";
import {DefaultArgResolvers, DefaultBotOptions} from "./Constants";
import Store from "../State/Store";
import {InternalCommand, BotState, IBotOptions, BotToken, BotEvent, IBot} from "./BotExtra";
import {Action} from "@atlas/automata";
import BotConnector from "./BotConnector";
import CommandRegistry from "../commands/CommandRegistry";
import BotHandler from "./BotHandler";
import {ArgumentType, ArgumentResolver} from "../commands/Type";

// TODO: Should emit an event when state changes.
export default class Bot<TState = any, TActionType = any> extends EventEmitter implements IBot<TState, TActionType> {
    // TODO: Temporary hard-coded user ID.
    /**
     * Access the bot's temporary file storage.
     */
    public readonly temp: Temp;

    /**
     * Provides management of services.
     */
    public readonly services: ServiceManager;

    /**
     * Command storage and retrival class.
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
    public readonly usePrefixCommand: boolean;

    // TODO: Even if it's not specified here, the throw command was loaded, verify that ONLY specific trivials can be loaded?
    /**
     * The internal commands to load.
     */
    public readonly internalCommands: InternalCommand[];

    /**
     * The owner of the bot's snowflake ID.
     */
    public readonly owner?: Snowflake;

    /**
     * The extra provided bot options.
     */
    public readonly options: IBotOptions;

    /**
     * Localization provider.
     */
    public readonly i18n?: Translation;

    /**
     * A list that keeps track of disposable objects and classes.
     */
    public readonly disposables: IDisposable[];

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
     * Stores argument resolvers which resolve input argument values into corresponding data.
     */
    public readonly argumentResolvers: Map<ArgumentType, ArgumentResolver>;

    /**
     * The bot token required to login to Discord.
     */
    public readonly token: BotToken;

    /**
     * Whether the bot is currently suspended and ignoring all user input.
     */
    protected isSuspended: boolean;

    /**
     * The start timestamp of the latest setup sequence.
     */
    protected setupStart: number = 0;

    /**
     * Handles the bot connection and setup sequence.
     */
    protected readonly connector: BotConnector;

    /**
     * @param {BotToken} token The bot token required to login to Discord.
     * @param {boolean} [testMode=false] Whether the bot is being used in testing. For internal use only.
     */
    public constructor(token: BotToken, options: Partial<IBotOptions<TState>>, testMode: boolean = false) {
        super();

        this.token = token;

        this.options = {
            ...DefaultBotOptions,
            ...options
        };

        // Special options for unit tests.
        if (testMode) {
            this.applyTestMode();
        }

        this.isSuspended = true;
        this.store = new Store<TState, TActionType>(this.options.initialState, this.options.reducers);
        this.state = BotState.Disconnected;
        this.paths = new PathResolver(this.options.paths);
        this.temp = new Temp();
        this.handle = new BotHandler(this);
        this.client = new Client();
        this.services = new ServiceManager(this);
        this.registry = new CommandRegistry(this);

        this.argumentResolvers = this.options.argumentResolvers
            ? new Map([...DefaultArgResolvers, ...this.options.argumentResolvers])
            : DefaultArgResolvers;

        this.commandHandler = new CommandHandler({
            commandStore: this.registry,
            errorHandlers: [] // TODO: Is this like it was? Is it ok?
        });

        this.console = new ConsoleInterface();
        this.usePrefixCommand = this.options.usePrefixCommand || true;

        this.internalCommands = this.options.internalCommands || [
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

        this.owner = this.options.owner;
        this.i18n = this.options.paths.languages ? new Translation(this.options.paths.languages) : undefined;
        this.languages = this.options.languages;
        this.analytics = new Analytics();
        this.disposables = [];
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
     */
    public get connected(): boolean {
        return this.state === BotState.Connected;
    }

    /**
     * Whether the bot is currently suspended and ignoring all user input.
     */
    public get suspended(): boolean {
        return this.isSuspended;
    }

    /**
     * Suspend or unsuspend the bot.
     * @param {boolean} suspended Whether to suspend the bot.
     */
    public setSuspended(suspended: boolean): this {
        this.isSuspended = suspended;
        this.emit(BotEvent.SuspensionStateChanged, suspended);

        return this;
    }

    /**
     * Post stats to various bot lists.
     */
    public async postStats(): Promise<void> {
        if (!this.client.user || Object.keys(this.options.keys).length === 0) {
            return;
        }

        const serverCount: number = this.client.guilds.size;

        // Discord Bot List.org.
        if (this.options.keys.dbl) {
            const dblUrl: string = "https://discordbots.org/api/bots/{botId}/stats";

            await axios.post(dblUrl.replace("{botId}", this.client.user.id), {
                server_count: serverCount
            }, {
                    headers: {
                        Authorization: this.options.keys.dbl
                    }
                }).catch((error: Error) => {
                    Log.warn(`Could not post stats to discordbots.org (${error.message})`);
                });
        }

        // Bots for Discord.com.
        if (this.options.keys.bfd) {
            const bfdUrl: string = "https://botsfordiscord.com/api/bot/{botId}";

            await axios.post(bfdUrl.replace("{botId}", this.client.user.id), {
                server_count: serverCount
            }, {
                    headers: {
                        Authorization: this.options.keys.bfd,
                        "Content-Type": "application/json"
                    }
                }).catch((error: Error) => {
                    Log.warn(`Could not post stats to botsfordiscord.com (${error.message})`);
                });
        }
    }

    /**
     * Attach a timeout to the bot.
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
     */
    public setInterval(action: any, time: number): NodeJS.Timeout {
        const interval: any = setInterval(action, time);

        this.intervals.push(interval);

        return interval;
    }

    /**
     * Clear an attached interval.
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
     */
    public async connect(): Promise<this> {
        this.setState(BotState.Connecting);
        await this.connector.setup();
        Log.verbose("Starting");

        await this.client.login(this.token).catch(async (error: Error) => {
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

    // TODO: "Multiple instances" upon restarts may be caused because of listeners not getting removed (and re-attached)?
    /**
     * Restart the Discord client.
     */
    public async reconnect(): Promise<this> {
        this.emit(BotEvent.Restarting);
        Log.verbose("Restarting");

        // Disconnect the bot which also disposes resources.
        await this.disconnect();

        // Reconnect the bot.
        await this.connect();
        this.emit(BotEvent.Restarted);

        return this;
    }

    /**
     * Reload the bot's fragments, modules, commands, tasks and services.
     */
    public async reload(): Promise<this> {
        const commands: number = this.registry.getAll().size;

        Log.verbose(`Reloading ${commands} command(s)`);

        const reloaded: number = await this.registry.reloadAll();

        Log.success(`Reloaded ${reloaded}/${commands} command(s)`);

        return this;
    }

    /**
     * Disconnect the Discord client.
     */
    public async disconnect(): Promise<this> {
        this.emit(BotEvent.Disconnecting);

        const servicesStopped: number = this.services.size;

        await this.services.stopAll();
        Log.verbose(`Stopped ${servicesStopped} service(s)`);
        await this.dispose();
        await this.client.destroy();

        // Re-create the client for complete reset.
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

        // TODO: Path may need to be resolved/maybe it won't be relative.
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

    public setState(state: BotState): this {
        (this.state as BotState) = state;

        return this;
    }

    protected applyTestMode() {
        (this.options as IBotOptions) = {
            ...this.options,
            useConsoleInterface: false,
            showAsciiTitle: false,
            internalCommands: [InternalCommand.Help, InternalCommand.Usage, InternalCommand.Ping],
            languages: ["test-language"],

            paths: {
                commands: path.resolve(path.join(__dirname, "../", "test", "test-commands")),
                languages: path.resolve(path.join("src", "test", "test-languages")),
                services: path.resolve(path.join(__dirname, "../", "test", "test-services")),
                tasks: path.resolve(path.join(__dirname, "../", "test", "test-tasks")),
            }
        };
    }
}
