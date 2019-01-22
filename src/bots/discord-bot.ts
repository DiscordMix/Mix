// Setup environment variables
require("dotenv").config();

import CommandParser from "../commands/command-parser";
import DiscordContext from "../commands/command-context";
import Util from "../core/util";
import Log from "../logging/log";
import {Client, Message, RichEmbed, Snowflake, TextChannel} from "discord.js";
import axios from "axios";

import Command, {
    RawArguments,
    UserGroup
} from "../commands/command";

import fs from "fs";
import StatCounter from "../core/stat-counter";
import ActionInterpreter from "../actions/action-interpreter";
import Optimizer from "../optimization/optimizer";
import BotMessages from "../core/messages";
import {InternalCommand, BotState, DiscordBotToken, BotEvent, Action} from "../core/bot-extra";
import BotConnector from "../core/bot-connector";
import DiscordClient from "../universal/discord/discord-client";
import {IDiscordBotOpts, IDiscordBot} from "../universal/discord/discord-bot";
import GenericBot from "./generic-bot";
import DiscordSettings from "../universal/discord/discord-settings";
import {DiscordMessage} from "../universal/discord/discord-message";

// TODO: Should emit an event when state changes
/**
 * The Discord bot class.
 * @extends GenericBot
 */
export default class DiscordBot<TState = any, TActionType = any> extends GenericBot<TState, TActionType> implements IDiscordBot<TState, TActionType> {
    public readonly prefixCommand: boolean;
    public readonly internalCommands: InternalCommand[];
    public readonly userGroups: UserGroup[];
    public readonly owner?: Snowflake;
    public readonly actionInterpreter: ActionInterpreter;
    public readonly client: DiscordClient;
    public readonly optimizer: Optimizer;

    protected setupStart: number = 0;

    protected settings: DiscordSettings;
    protected options: IDiscordBotOpts;

    // TODO: Implement stat counter
    protected readonly statCounter: StatCounter;

    protected readonly connector: BotConnector;

    /**
     * Setup the bot from an object
     * @param {Partial<IDiscordBotOpts<TState>> | DiscordBotToken} botOptsOrToken
     * @param {boolean} [testMode=false]
     */
    public constructor(botOptsOrToken: Partial<IDiscordBotOpts<TState>> | DiscordBotToken, testMode: boolean = false) {
        super();

        // Special options for unit tests
        // Temporarily disabled/commented out
        /* if (testMode) {
            (this.options.extra as any) = {
                ...this.options.extra,
                asciiTitle: false,
                consoleInterface: false
            };

            (this.options.settings as any).paths = {
                commands: path.resolve(path.join(__dirname, "../", "test", "test-commands")),
                emojis: path.resolve(path.join(__dirname, "../", "test", "test-emojis")),
                languages: path.resolve(path.join("src", "test", "test-languages")),
                plugins: path.resolve(path.join(__dirname, "../", "test", "test-plugins")),
                services: path.resolve(path.join(__dirname, "../", "test", "test-services")),
                tasks: path.resolve(path.join(__dirname, "../", "test", "test-tasks")),
            };

            this.options = {
                ...this.options,
                internalCommands: [InternalCommand.Help, InternalCommand.Usage, InternalCommand.Ping],
                languages: ["test-language"],
            };
        } */

        if (!this.options || !this.options.settings || typeof this.options.settings !== "object") {
            throw Log.error(BotMessages.SETUP_INVALID);
        }

        this.settings = null as any;

        /**
         * @type {DiscordClient}
         * @readonly
         */
        this.client = new DiscordClient();

        /**
         * Whether the built-in prefix command should be used.
         * @type {boolean}
         * @readonly
         */
        this.prefixCommand = this.options.prefixCommand || true;

        /**
         * The internal commands to load.
         * @todo Even if it's not specified here, the throw command was loaded, verify that ONLY specific trivials can be loaded?
         * @type {InternalCommand[]}
         * @readonly
         */
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

        // TODO: Make use of the userGroups property
        /**
         * @type {UserGroup[]}
         * @readonly
         */
        this.userGroups = this.options.userGroups || [];

        /**
         * The owner of the bot's snowflake ID.
         * @type {Snowflake | undefined}
         * @readonly
         */
        this.owner = this.options.owner;

        /**
         * Used for measuring interaction with the bot.
         * @type {StatCounter}
         */
        this.statCounter = new StatCounter();

        /**
         * @type {ActionInterpreter}
         * @readonly
         */
        this.actionInterpreter = new ActionInterpreter(this);

        /**
         * Optimization engine for large bots.
         * @type {Optimizer}
         * @readonly
         */
        this.optimizer = new Optimizer(this);

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

        if (this.extraOpts.logMessages) {
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
        if ((!msg.author.bot || (msg.author.bot && !this.extraOpts.ignoreBots)) /*&& message.content.startsWith(this.settings.general.prefix)*/ && CommandParser.validate(msg.content, this.registry, this.settings.general.prefix)) {
            if (this.extraOpts.allowCommandChain) {
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
                Log.error(BotMessages.SETUP_TOKEN_INVALID);
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
        Log.verbose(BotMessages.RESTARTING);

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
     * @param {DiscordMessage} msg
     * @return {DiscordContext}
     */
    protected createCommandContext(msg: DiscordMessage): DiscordContext {
        return new DiscordContext({
            bot: this,
            msg,
            // args: CommandParser.resolveArguments(CommandParser.getArguments(content), this.commandHandler.argumentTypes, resolvers, message),

            // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review)

            label: CommandParser.getCommandBase(msg.content, this.settings.general.prefix)
        });
    }
}
