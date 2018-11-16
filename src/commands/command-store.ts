import Log from "../core/log";
import Bot from "../core/bot";
import Command, {GenericCommand} from "./command";
import CommandContext from "./command-context";
import {Snowflake} from "discord.js";
import FragmentLoader, {IPackage, ILivePackage} from "../fragments/fragment-loader";
import Utils from "../core/utils";

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

export type ICommandCooldown = {
    readonly context: CommandContext;
    readonly command: Command;
    readonly end: number;
}

export type ICommandPackage = ILivePackage<Command>;

const validCommandNamePattern: RegExp = /^[a-z_0-9-]{1,40}$/mi;

export type ICommandMap = Map<string, ICommandPackage>;

export type IReadonlyCommandMap = ReadonlyMap<string, ICommandPackage>;

export default class CommandStore {
    public readonly bot: Bot;
    public readonly cooldowns: Map<Snowflake, Map<string, number>>;

    public simpleCommands: Map<string, any>;

    private readonly commands: ICommandMap;
    private readonly released: string[];
    private readonly aliases: Map<string, string>;

    /**
     * @param {Bot} bot
     */
    public constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {ICommandMap}
         * @private
         */
        this.commands = new Map();

        /**
         * @type {string[]}
         * @readonly
         */
        this.released = [];

        /**
         * @type {Map<string, string>}
         * @private
         */
        this.aliases = new Map();

        /**
         * @type {ICommandCooldown[]}
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
     * @param {string} commandName
     * @return {Promise<boolean>}
     */
    public async reload(commandName: string): Promise<boolean> {
        if (!this.commands.has(commandName)) {
            return false;
        }

        const packg: ICommandPackage = this.commands.get(commandName) as ICommandPackage;
        const reloadedPackage: IPackage | null = await FragmentLoader.reload(packg.path) as IPackage | null;

        if (reloadedPackage === null) {
            return false;
        }

        // Delete current command
        this.commands.delete(commandName);

        const cmdPackg: ICommandPackage | null = await this.bot.fragments.prepare<Command>(reloadedPackage);

        if (cmdPackg === null) {
            return false;
        }

        // Register new one
        this.register({
            instance: cmdPackg.instance,
            path: reloadedPackage.path
        });

        return true;
    }

    public get size(): number {
        return this.commands.size;
    }

    public async release(name: string): Promise<boolean> {
        if (this.commands.has(name) && !this.released.includes(name)) {
            const command: Command = this.commands.get(name) as any;

            await command.dispose();
            this.commands.delete(name);
            this.released.push(name);

            return true;
        }

        return false;
    }

    public isReleased(name: string): boolean {
        return this.released.includes(name);
    }

    public getReleased(): ReadonlyArray<string> {
        return this.released;
    }

    /**
     * Reload all commands
     * @return {Promise<number>} The amount of commands that were reloaded
     */
    public async reloadAll(): Promise<number> {
        let reloaded: number = 0;

        for (let [base, command] of this.commands) {
            if (await this.reload(base)) {
                reloaded++;
            }
        }

        return reloaded;
    }

    /**
     * Register a command
     * @param {ICommandPackage} commandPackage
     */
    public register(commandPackage: ICommandPackage): boolean {
        if (Utils.isEmpty(commandPackage) || typeof commandPackage !== "object") {
            return false;
        }

        const commandName: string = commandPackage.instance.meta.name.trim();

        if (validCommandNamePattern.test(commandName) === false) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Invalid name)`);

            return false;
        }
        else if (this.get(commandName) !== null) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Already exists)`);

            return false;
        }

        // Also register aliases
        if (commandPackage.instance.aliases && commandPackage.instance.aliases.length > 0) {
            for (let i: number = 0; i < commandPackage.instance.aliases.length; i++) {
                if (this.aliases.get(commandPackage.instance.aliases[i]) !== undefined) {
                    // TODO: Is undoIdx < i correct? or should it be undoIdx <= i
                    // Undo
                    for (let undoIdx = 0; undoIdx < i; undoIdx++) {
                        this.aliases.delete(commandPackage.instance.aliases[undoIdx]);
                    }

                    Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (A command with the same alias already exists)`);

                    return false;
                }

                this.aliases.set(commandPackage.instance.aliases[i], commandName);
            }
        }

        this.commands.set(commandName, commandPackage);

        return true;
    }

    /**
     * @param {string} commandBase
     * @return {Promise<boolean>} Whether the command was removed
     */
    public async remove(commandBase: string): Promise<boolean> {
        // TODO: Verify that command is only Command and not WeakCommand etc.
        const command: Command = await this.get(commandBase) as Command;

        // Remove any command aliases that might exist
        if (command.aliases && command.aliases.length > 0) {
            for (let i: number = 0; i < command.aliases.length; i++) {
                this.aliases.delete(command.aliases[i]);
            }
        }

        return this.commands.delete(commandBase);
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    public contains(name: string): boolean {
        if (!name) {
            return false;
        }

        return this.commands.has(name) || this.aliases.has(name) || this.released.includes(name);
    }

    /**
     * @param {string} name
     * @return {Command | null}
     */
    public async get(name: string): Promise<Command | null> {
        // TODO: CRITICAL: Will probably error since property may be undefined (Trying to access .module of undefined)
        if (this.aliases.get(name) !== undefined) {
            const command: ICommandPackage | null = (this.commands.get(this.aliases.get(name) as string) as ICommandPackage) || null;

            return command === null ? null : command.instance;
        }
        else if (this.released.includes(name)) {
            // TODO: Re-load command here

            const packg: IPackage | null = await FragmentLoader.load(this.bot.paths.command(name));

            if (packg !== null && (packg.module as any).prototype instanceof Command) {
                if (!await this.bot.fragments.enable(packg)) {
                    Log.warn(`[CommandStore.get] Failed to re-load released command '${name}'`);
                }
            }
            else {
                Log.warn(`[CommandStore.get] Expecting released command '${name}' to exist for re-load and to be a command`);

                return null;
            }

            return {} as Command;
        }

        const command: ICommandPackage | null = (this.commands.get(name) as ICommandPackage) || null;

        return command === null ? null : command.instance;
    }

    /**
     * @param {ICommandPackage[]} commands
     * @return {CommandStore}
     */
    public registerMultiple(commands: ICommandPackage[]): this {
        for (let i = 0; i < commands.length; i++) {
            this.register(commands[i]);
        }

        return this;
    }

    /**
     * Get all the registered commands
     * @return {IReadonlyCommandMap}
     */
    public getAll(): IReadonlyCommandMap {
        return this.commands as IReadonlyCommandMap;
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

    /**
     * @param {Snowflake} userId
     * @param {string} commandName
     * @return {boolean}
     */
    public clearCooldown(userId: Snowflake, commandName: string): boolean {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(userId) || null;

        if (issuerCooldowns) {
            issuerCooldowns.delete(commandName);

            return true;
        }

        return false;
    }

    /**
     * @param {Snowflake} userId
     * @param {number} cooldown
     * @param {string} commandName
     */
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
     * @return {Promise<void>}
     */
    public async disposeAll(): Promise<void> {
        for (let [base, command] of this.commands) {
            if (command instanceof GenericCommand) {
                await command.dispose();
            }
        }
    }

    /**
     * Unload all commandStore
     */
    public unloadAll(): void {
        if (this.commands.size > 0) {
            const count: number = this.commands.size;

            this.commands.clear();
            Log.success(`[CommandManager.unloadAll] Unloaded ${count} command(s)`);
        }
    }
}
