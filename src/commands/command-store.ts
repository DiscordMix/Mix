import Log from "../core/log";
import Bot from "../core/bot";
import Command from "./command";
import CommandAuthStore from "./auth-stores/command-auth-store";
import CommandContext from "./command-context";
import {Message, Snowflake} from "discord.js";
import {WeakCommand} from "..";
import {DecoratorCommand, SimpleCommand} from "../decorators/decorators";
// import Collection from "../core/collection";

/**
 * @enum {number}
 */
export enum CommandManagerEvent {
    DisallowedEnvironment,
    DisabledCommand,
    ArgumentAmountMismatch,
    CommandMayNotExecute,
    InvalidArguments,
    MissingSelfPermissions,
    MissingIssuerPermissions,
    CommandError,
    NoAuthority,
    UnderCooldown
}

export interface CommandCooldown {
    readonly context: CommandContext;
    readonly command: Command;
    readonly end: number;
}

const validCommandNamePattern: RegExp = /^[a-z_0-9]{1,40}$/gmi;

export type CommandMap = Map<string, Command | DecoratorCommand>;

export type ReadonlyCommandMap = ReadonlyMap<string, Command | DecoratorCommand>;

export default class CommandStore /* extends Collection */ {
    public readonly bot: Bot;
    public readonly authStore: CommandAuthStore;
    public readonly cooldowns: Map<Snowflake, Map<string, number>>;

    public simpleCommands: Map<string, any>;

    private readonly commands: CommandMap;

    /**
     * @param {Bot} bot
     * @param {CommandAuthStore} authStore
     */
    constructor(bot: Bot, authStore: CommandAuthStore) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {CommandAuthStore}
         * @private
         * @readonly
         */
        this.authStore = authStore;

        /**
         * @type {CommandMap}
         * @private
         */
        this.commands = new Map();

        /**
         * @type {Array<CommandCooldown>}
         * @private
         * @readonly
         */
        this.cooldowns = new Map();

        /**
         * @type {Map<string, any>}
         */
        this.simpleCommands = new Map();
    }

    /**
     * @param {Command} command
     */
    public register(command: Command | WeakCommand): void {
        if (!validCommandNamePattern.test(command.meta.name)) {
            Log.debug("command name", command.meta.name);
            Log.debug("result is ", !validCommandNamePattern.test(command.meta.name));

            Log.warn(`[CommandStore.register] Failed to register command '${command.meta.name}' (Invalid name)`);

            return;
        }
        else if (this.commands.get(command.meta.name) !== undefined) {
            Log.warn(`[CommandStore.register] Failed to register command '${command.meta.name}' (Already exists)`);
        }

        this.commands.set(command.meta.name, command);
    }

    /**
     * @param {SimpleCommand} command The command to register
     */
    public registerDecorator(command: DecoratorCommand): void {
        if (!validCommandNamePattern.test(command.meta.name)) {
            Log.error(`[CommandStore.registerSimple] Failed to register simple command '${command.meta.name}' (Invalid name)`);

            return;
        }
        else if (this.commands.get(command.meta.name) !== undefined) {
            Log.error(`[CommandStore.registerSimple] Failed to register simple command '${command.meta.name}' (Already exists)`);

            return;
        }

        this.commands.set(command.meta.name, command);
    }

    /**
     * @param {string} commandBase
     * @return {boolean} Whether the command was removed
     */
    public remove(commandBase: string): boolean {
        return this.commands.delete(commandBase);
    }

    /**
     * @param {string} commandBase
     * @return {boolean}
     */
    public contains(commandBase: string): boolean {
        return this.commands.has(commandBase);
    }

    public get(commandBase: string): Command | DecoratorCommand | null {
        return this.commands.get(commandBase) || null;
    }

    /**
     * @param {Array<Command>} commands
     * @return {CommandStore}
     */
    public registerMultiple(commands: Array<Command>): this {
        for (let i = 0; i < commands.length; i++) {
            this.register(commands[i]);
        }

        return this;
    }

    public registerMultipleDecorator(commands: Array<DecoratorCommand>): this {
        for (let i = 0; i < commands.length; i++) {
            this.registerDecorator(commands[i]);
        }

        return this;
    }

    /**
     * Get all the registered commands
     * @return {ReadonlyCommandMap}
     */
    public getAll(): ReadonlyCommandMap {
        return this.commands as ReadonlyCommandMap;
    }

    /**
     * @param {Snowflake} userId
     * @param {string} commandName
     * @return {number | null} The cooldown
     */
    public getCooldown(userId: Snowflake, commandName: string): number | null {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(userId) || null;

        if (issuerCooldowns === null) {
            return null;
        }

        return issuerCooldowns.get(commandName) || null;
    }

    /**
     * @param {Snowflake} userId
     * @param {Command} commandName
     * @return {boolean}
     */
    public cooldownExpired(userId: Snowflake, commandName: string): boolean {
        const cooldown: number | null = this.getCooldown(userId, commandName);

        return (cooldown !== null && Date.now() > cooldown) || cooldown === null;
    }

    public clearCooldown(userId: Snowflake, commandName: string): boolean {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(userId) || null;

        if (issuerCooldowns) {
            issuerCooldowns.delete(commandName);

            return true;
        }

        return false;
    }

    public setCooldown(userId: Snowflake, cooldown: number, commandName: string): void {
        const currentCooldown: number | null = this.getCooldown(userId, commandName);

        if (currentCooldown !== null) {
            // Must exist at this point
            (this.cooldowns.get(userId) as Map<string, number>).set(commandName, cooldown);

            return;
        }

        const newCooldowns: Map<string, number> = new Map();

        newCooldowns.set(commandName, cooldown);

        this.cooldowns.set(userId, newCooldowns);
    }

    /**
     * Unload all commandStore
     */
    public unloadAll(): void {
        if (this.commands.size > 0) {
            const count = this.commands.size;

            this.commands.clear();
            Log.success(`[CommandManager.unloadAll] Unloaded ${count} command(s)`);
        }
    }
}
