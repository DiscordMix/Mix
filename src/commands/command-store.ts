import Log from "../core/log";
import Bot from "../core/bot";
import Command from "./command";
import CommandAuthStore from "./auth-stores/command-auth-store";
import CommandContext from "./command-context";
import {Snowflake} from "discord.js";
import {WeakCommand} from "..";
import {DecoratorCommand} from "../decorators/decorators";
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

const validCommandNamePattern: RegExp = /^[a-z_0-9]{1,40}$/mi;

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
         * @type {CommandCooldown[]}
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
        const commandName: string = command.meta.name.trim();

        if (validCommandNamePattern.test(commandName) === false) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Invalid name)`);

            return;
        }
        else if (this.commands.get(commandName) !== undefined) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Already exists)`);

            return;
        }

        // Also register aliases
        if (command.aliases && command.aliases.length > 0) {
            for (let i: number = 0; i < command.aliases.length; i++) {
                if (this.commands.get(command.aliases[i]) !== undefined) {
                    // TODO: Is undoIdx < i correct? or should it be undoIdx <= i
                    // Undo
                    for (let undoIdx = 0; undoIdx < i; undoIdx++) {
                        this.commands.delete(command.aliases[undoIdx]);
                    }

                    Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (A command with the same alias already exists)`);

                    return;
                }

                this.commands.set(command.aliases[i], command);
            }
        }

        this.commands.set(commandName, command);
    }

    /**
     * @param {SimpleCommand} command The command to register
     */
    public registerDecorator(command: DecoratorCommand): void {
        if (validCommandNamePattern.test(command.meta.name) === false) {
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
     * @param {Command[]} commands
     * @return {CommandStore}
     */
    public registerMultiple(commands: Command[]): this {
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
