import Log from "../core/log";
import Bot, {InternalCommand} from "../core/bot";
import Command, {GenericCommand} from "./command";
import CommandContext from "./command-context";
import {Snowflake} from "discord.js";
import FragmentLoader, {IPackage, ILivePackage} from "../fragments/fragment-loader";
import Utils from "../core/utils";
import path from "path";

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

    protected readonly commands: ICommandMap;
    protected readonly released: Map<string, string>;
    protected readonly aliases: Map<string, string>;

    /**
     * @param {Bot} bot
     */
    public constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @protected
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {ICommandMap}
         * @protected
         */
        this.commands = new Map();

        /**
         * @type {string[]}
         * @readonly
         */
        this.released = new Map();

        /**
         * @type {Map<string, string>}
         * @protected
         */
        this.aliases = new Map();

        /**
         * @type {ICommandCooldown[]}
         * @protected
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
        await this.register({
            instance: cmdPackg.instance,
            path: reloadedPackage.path
        });

        return true;
    }

    public get size(): number {
        return this.commands.size;
    }

    public async release(name: string): Promise<boolean> {
        // Internal commands should not be released
        if (this.bot.internalCommands.includes(name as InternalCommand)) {
            return false;
        }
        else if (this.contains(name) && !this.isReleased(name)) {
            const cmdPackg: ICommandPackage = this.commands.get(name) as ICommandPackage;

            await cmdPackg.instance.dispose();
            await this.remove(name, (this.commands.get(name) as ICommandPackage).instance.aliases);
            delete require.cache[cmdPackg.path];
            this.released.set(name, cmdPackg.path);

            return true;
        }

        return false;
    }

    public isReleased(name: string): boolean {
        return this.released.has(path.basename(name).split(".")[0]);
    }

    public getReleased(): ReadonlyMap<string, string> {
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
    public async register(commandPackage: ICommandPackage): Promise<boolean> {
        if (Utils.isEmpty(commandPackage) || typeof commandPackage !== "object") {
            return false;
        }

        const commandName: string = commandPackage.instance.meta.name.trim();

        if (validCommandNamePattern.test(commandName) === false) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Invalid name)`);

            return false;
        }
        else if (this.contains(commandName) && !this.isReleased(commandName)) {
            Log.warn(`[CommandStore.register] Failed to register command '${commandName}' (Already registered)`);

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

    // TODO: Accepting aliases as an argument for a hot-fix of an infinite loop (looks like this.get(commandBase) calls back .remove() somehow or something similar)
    /**
     * @param {string} commandBase
     * @return {boolean} Whether the command was removed
     */
    public async remove(commandBase: string, aliases: string[]): Promise<boolean> {
        // TODO: Release resources when removing too (delete require.cache)
        // Remove any command aliases that might exist
        if (aliases.length > 0) {
            for (let i: number = 0; i < aliases.length; i++) {
                this.aliases.delete(aliases[i]);
            }
        }

        // TODO: Remove cooldown if was set for command?

        if (this.isReleased(commandBase) && !this.released.delete(commandBase)) {
            return false;
        }

        return this.commands.delete(commandBase);
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    public contains(name: string): boolean {
        if (!name || typeof name !== "string") {
            return false;
        }

        return this.commands.has(name) || this.aliases.has(name) || this.isReleased(name);
    }

    /**
     * @todo Should release/reload not when accessing, but when actually executing
     * @param {string} name
     * @return {Command | null}
     */
    public async get(name: string): Promise<Command | null> {
        // TODO: CRITICAL: Will probably error since property may be undefined (Trying to access .module of undefined)
        if (this.aliases.get(name) !== undefined) {
            const command: ICommandPackage | null = (this.commands.get(this.aliases.get(name) as string) as ICommandPackage) || null;

            return command === null ? null : command.instance;
        }
        else if (this.isReleased(name)) {
            // TODO: Re-load command here

            const packg: IPackage | null = await FragmentLoader.load(this.released.get(name) as string);

            if (packg !== null && (packg.module as any).prototype instanceof Command) {
                if (!await this.bot.fragments.enable(packg)) {
                    Log.warn(`[CommandStore.get] Failed to re-load released command '${name}'`);

                    return null;
                }

                return await this.get(name);
            }
            else {
                Log.warn(`[CommandStore.get] Expecting released command '${name}' to exist for re-load and to be a command`);

                return null;
            }
        }

        const command: ICommandPackage | null = (this.commands.get(name) as ICommandPackage) || null;

        return command === null ? null : command.instance;
    }

    // TODO: Return amount registered instead
    /**
     * @param {ICommandPackage[]} commands
     * @return {Promise<CommandStore>}
     */
    public async registerMultiple(commands: ICommandPackage[]): Promise<this> {
        for (let i = 0; i < commands.length; i++) {
            await this.register(commands[i]);
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
