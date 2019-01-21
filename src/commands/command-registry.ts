import Log from "../logging/log";
import Command, {GenericCommand} from "./command";
import DiscordContext from "./command-context";
import {Snowflake} from "discord.js";
import Loader, {IPackage, ILivePackage} from "../fragments/loader";
import Util from "../core/util";
import {InternalCommand, IBot} from "../core/bot-extra";
import {PromiseOr} from "@atlas/xlib";

export interface ICommandCooldown {
    readonly context: DiscordContext;
    readonly command: Command;
    readonly end: number;
}

export type CommandPackage = ILivePackage<Command>;

const validCommandNamePattern: RegExp = /^[a-z_0-9-]{1,40}$/mi;

export type CommandMap = Map<string, CommandPackage>;

export type ReadonlyCommandMap = ReadonlyMap<string, CommandPackage>;

export interface ICommandRegistry {
    readonly bot: IBot;
    readonly cooldowns: Map<Snowflake, Map<string, number>>;
    readonly size: number;

    reload(commandName: string): PromiseOr<boolean>;
    reloadAll(): PromiseOr<number>;
    register(commandPackage: CommandPackage): PromiseOr<boolean>;
    remove(name: string, aliases: string[]): PromiseOr<boolean>;
    contains(name: string): boolean;
    get(name: string): PromiseOr<Command | null>;
    registerMultiple(commands: CommandPackage[]): PromiseOr<number>;
    getAll(): ReadonlyCommandMap;
    getCooldown(user: Snowflake, command: string): number | null;
    hasCooldownExpired(user: Snowflake, command: string): boolean;
    clearCooldown(user: Snowflake, command: string): boolean;
    setCooldown(user: Snowflake, cooldown: number, command: string): this;
    disposeAll(): PromiseOr<this>;
    unloadAll(): PromiseOr<this>;
}

export default class CommandRegistry implements ICommandRegistry {
    public readonly bot: IBot;
    public readonly cooldowns: Map<Snowflake, Map<string, number>>;

    public simpleCommands: Map<string, any>;

    protected readonly commands: CommandMap;
    protected readonly aliases: Map<string, string>;

    /**
     * @param {IBot} bot
     */
    public constructor(bot: IBot) {
        /**
         * @type {IBot}
         * @protected
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {CommandMap}
         * @protected
         */
        this.commands = new Map();

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
     * Reload a command.
     * @param {string} name The name of the command to reload.
     * @return {Promise<boolean>} Whether the command was successfully reloaded.
     */
    public async reload(name: string): Promise<boolean> {
        if (!this.commands.has(name)) {
            return false;
        }

        const packg: CommandPackage = this.commands.get(name) as CommandPackage;
        const reloadedPackage: IPackage | null = await Loader.reload(packg.path) as IPackage | null;

        if (reloadedPackage === null) {
            return false;
        }

        // Delete current command
        this.commands.delete(name);

        const cmdPackg: CommandPackage | null = await this.bot.fragments.prepare<Command>(reloadedPackage);

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

    /**
     * Reload all commands.
     * @return {Promise<number>} The amount of commands that were reloaded.
     */
    public async reloadAll(): Promise<number> {
        let reloaded: number = 0;

        for (const [base, command] of this.commands) {
            if (await this.reload(base)) {
                reloaded++;
            }
        }

        return reloaded;
    }

    /**
     * Register a command.
     * @param {CommandPackage} commandPackage
     * @return {Promise<boolean>}
     */
    public async register(commandPackage: CommandPackage): Promise<boolean> {
        if (Util.isEmpty(commandPackage) || typeof commandPackage !== "object") {
            return false;
        }

        const commandName: string = commandPackage.instance.meta.name.trim();

        if (validCommandNamePattern.test(commandName) === false) {
            Log.warn(`Failed to register command '${commandName}' (Invalid name)`);

            return false;
        }
        else if (this.contains(commandName) && !this.isReleased(commandName)) {
            Log.warn(`Failed to register command '${commandName}' (Already registered)`);

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

                    Log.warn(`Failed to register command '${commandName}' (A command with the same alias already exists)`);

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
     * @param {string} name
     * @param {string[]} aliases
     * @return {boolean} Whether the command was removed
     */
    public remove(name: string, aliases: string[]): boolean {
        // TODO: Release resources when removing too (delete require.cache)
        // Remove any command aliases that might exist
        if (aliases.length > 0) {
            for (const alias of aliases) {
                this.aliases.delete(alias);
            }
        }

        // TODO: Remove cooldown if was set for command?

        return this.commands.delete(name);
    }

    /**
     * @param {string} name
     * @return {boolean}
     */
    public contains(name: string): boolean {
        if (!name || typeof name !== "string") {
            return false;
        }

        return this.commands.has(name) || this.aliases.has(name);
    }

    /**
     * @todo Should release/reload not when accessing, but when actually executing
     * @param {string} name
     * @return {Promise<Command | null>}
     */
    public async get(name: string): Promise<Command | null> {
        // TODO: CRITICAL: Will probably error since property may be undefined (Trying to access .module of undefined)
        if (this.aliases.get(name) !== undefined) {
            const commandPackg: CommandPackage | null = (this.commands.get(this.aliases.get(name) as string) as CommandPackage) || null;

            return commandPackg === null ? null : commandPackg.instance;
        }
        else if (this.isReleased(name)) {
            // TODO: Re-load command here

            const packg: IPackage | null = await Loader.load(this.released.get(name) as string);

            if (packg !== null && (packg.module as any).prototype instanceof Command) {
                if (!await this.bot.fragments.enable(packg)) {
                    Log.warn(`Failed to re-load released command '${name}'`);

                    return null;
                }

                return await this.get(name);
            }
            else {
                Log.warn(`Expecting released command '${name}' to exist for re-load and to be a command`);

                return null;
            }
        }

        const command: CommandPackage | null = (this.commands.get(name) as CommandPackage) || null;

        return command === null ? null : command.instance;
    }

    // TODO: Return amount registered instead
    /**
     * Register multiple command packages.
     * @param {CommandPackage[]} commands
     * @return {Promise<number>}
     */
    public async registerMultiple(commands: CommandPackage[]): Promise<number> {
        let registered: number = 0;

        for (const command of commands) {
            if (await this.register(command)) {
                registered++;
            }
        }

        return registered;
    }

    /**
     * Get all the registered commands.
     * @return {ReadonlyCommandMap}
     */
    public getAll(): ReadonlyCommandMap {
        return this.commands as ReadonlyCommandMap;
    }

    /**
     * Retrieve the cooldown of a command.
     * @param {Snowflake} user
     * @param {string} command
     * @return {number | null} The cooldown
     */
    public getCooldown(user: Snowflake, command: string): number | null {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(user) || null;

        if (issuerCooldowns === null) {
            return null;
        }

        return issuerCooldowns.get(command) || null;
    }

    /**
     * Determine if the cooldown of a command has expired.
     * @param {Snowflake} user
     * @param {string} command
     * @return {boolean}
     */
    public hasCooldownExpired(user: Snowflake, command: string): boolean {
        const cooldown: number | null = this.getCooldown(user, command);

        return (cooldown !== null && Date.now() > cooldown) || cooldown === null;
    }

    /**
     * Clear the cooldown of a command.
     * @param {Snowflake} user
     * @param {string} command
     * @return {boolean}
     */
    public clearCooldown(user: Snowflake, command: string): boolean {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(user) || null;

        if (issuerCooldowns) {
            issuerCooldowns.delete(command);

            return true;
        }

        return false;
    }

    /**
     * Set a cooldown for a certain command.
     * @param {Snowflake} user
     * @param {number} cooldown
     * @param {string} command
     * @return {this}
     */
    public setCooldown(user: Snowflake, cooldown: number, command: string): this {
        const currentCooldown: number | null = this.getCooldown(user, command);

        if (currentCooldown !== null) {
            // Must exist at this point
            (this.cooldowns.get(user) as Map<string, number>).set(command, cooldown);

            return this;
        }

        const newCooldowns: Map<string, number> = new Map();

        newCooldowns.set(command, cooldown);
        this.cooldowns.set(user, newCooldowns);

        return this;
    }

    /**
     * Dispose all commands.
     * @return {Promise<this>}
     */
    public async disposeAll(): Promise<this> {
        for (const [base, command] of this.commands) {
            if (command instanceof GenericCommand) {
                await command.dispose();
            }
        }

        return this;
    }

    /**
     * Unload all commands.
     * @return {this}
     */
    public unloadAll(): this {
        if (this.commands.size > 0) {
            const count: number = this.commands.size;

            this.commands.clear();
            Log.success(`Unloaded ${count} command(s)`);
        }

        return this;
    }
}
