import Log from "../core/log";
import Bot from "../core/bot";
import Command, {GenericCommand, RawArguments} from "./command";
import Context from "./context";
import {Snowflake, Message} from "discord.js";
import Loader, {IPackage, ILivePackage} from "../fragments/loader";
import Util from "../core/util";
import path from "path";
import {InternalCommand} from "../core/bot-extra";
import {PromiseOr} from "@atlas/xlib";
import CommandParser from "./command-parser";
import BotMessages from "../core/messages";

export interface ICommandCooldown {
    readonly context: Context;
    readonly command: Command;
    readonly end: number;
}

export type CommandPackage = ILivePackage<Command>;

/**
 * Represents a pattern for valid command names.
 */
const validCommandNamePattern: RegExp = /^[a-z_0-9-]{1,40}$/mi;

export type CommandMap = Map<string, CommandPackage>;

export type ReadonlyCommandMap = ReadonlyMap<string, CommandPackage>;

export interface ICommandRegistry {
    readonly bot: Bot;
    readonly cooldowns: Map<Snowflake, Map<string, number>>;
    readonly size: number;

    reload(commandName: string): PromiseOr<boolean>;
    release(name: string): PromiseOr<boolean>;
    isReleased(name: string): boolean;
    getReleased(): ReadonlyMap<string, string>;
    reloadAll(): PromiseOr<number>;
    register(commandPackage: CommandPackage): PromiseOr<boolean>;
    remove(name: string, aliases: string[]): PromiseOr<boolean>;
    contains(name: string): boolean;
    get(name: string): PromiseOr<Command | null>;
    registerMultiple(commands: CommandPackage[]): PromiseOr<number>;
    getAll(): ReadonlyCommandMap;
    getCooldown(user: Snowflake, command: string): number | null;
    cooldownExpired(user: Snowflake, command: string): boolean;
    clearCooldown(user: Snowflake, command: string): boolean;
    setCooldown(user: Snowflake, cooldown: number, command: string): this;
    disposeAll(): PromiseOr<this>;
    unloadAll(): PromiseOr<this>;
    invoke(base: string, referer: Message, ...args: string[]): PromiseOr<any>;
}

/**
 * Provides storage and retrieval of commands.
 */
export default class CommandRegistry implements ICommandRegistry {
    public readonly bot: Bot;
    public readonly cooldowns: Map<Snowflake, Map<string, number>>;

    public simpleCommands: Map<string, any>;

    protected readonly commands: CommandMap;
    protected readonly released: Map<string, string>;
    protected readonly aliases: Map<string, string>;

    public constructor(bot: Bot) {
        this.bot = bot;
        this.commands = new Map();
        this.released = new Map();
        this.aliases = new Map();
        this.cooldowns = new Map();
        this.simpleCommands = new Map();
    }

    /**
     * Reload a certain command's module from the Node.js cache.
     */
    public async reload(commandName: string): Promise<boolean> {
        if (!this.commands.has(commandName)) {
            return false;
        }

        const packg: CommandPackage = this.commands.get(commandName) as CommandPackage;
        const reloadedPackage: IPackage | null = await Loader.reload(packg.path) as IPackage | null;

        if (reloadedPackage === null) {
            return false;
        }

        // Delete current existing command and it's aliases.
        await this.remove(commandName, packg.instance.aliases);

        const cmdPackg: CommandPackage | null = await this.bot.fragments.prepare<Command>(reloadedPackage);

        if (cmdPackg === null) {
            return false;
        }

        // Register new one.
        await this.register({
            instance: cmdPackg.instance,
            path: reloadedPackage.path
        });

        return true;
    }

    /**
     * The amount of registered commands.
     */
    public get size(): number {
        return this.commands.size;
    }

    public async release(name: string): Promise<boolean> {
        // Internal commands should not be released
        if (this.bot.internalCommands.includes(name as InternalCommand)) {
            return false;
        }
        else if (this.contains(name) && !this.isReleased(name)) {
            const cmdPackg: CommandPackage = this.commands.get(name) as CommandPackage;

            await cmdPackg.instance.dispose();
            await this.remove(name, (this.commands.get(name) as CommandPackage).instance.aliases);
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
     * Reload all commands.
     * @return {Promise<number>} The amount of commands that were reloaded.
     */
    public async reloadAll(): Promise<number> {
        let reloaded: number = 0;

        // Clone command to avoid infinite loop.
        const commands: Map<string, ILivePackage<Command<object>>> = new Map(this.commands);

        for (const [base, command] of commands) {
            if (await this.reload(base)) {
                reloaded++;
            }
        }

        return reloaded;
    }

    /**
     * Register a command.
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

    // TODO: Accepting aliases as an argument for a hot-fix of an infinite loop (looks like this.get(commandBase) calls back .remove() somehow or something similar).
    /**
     * Remove a command from the registry along with it's registered aliases.
     * @param {string} name The name of the command to remove.
     * @return {Promise<boolean>} Whether the command was removed.
     */
    public async remove(name: string, aliases: string[]): Promise<boolean> {
        // TODO: Release resources when removing too (delete require.cache)
        // Remove any command aliases that might exist
        if (aliases.length > 0) {
            for (const alias of aliases) {
                this.aliases.delete(alias);
            }
        }

        // TODO: Remove cooldown if was set for command?

        if (this.isReleased(name) && !this.released.delete(name)) {
            return false;
        }

        return this.commands.delete(name);
    }

    /**
     * Determine whether a certain command is stored.
     * @param {string} name The name of the command to search for.
     * @return {boolean} Whether the specified command is registered.
     */
    public contains(name: string): boolean {
        if (!name || typeof name !== "string") {
            return false;
        }

        return this.commands.has(name) || this.aliases.has(name) || this.isReleased(name);
    }

    // TODO: Should release/reload not when accessing, but when actually executing.
    public async get(name: string): Promise<Command | null> {
        // TODO: CRITICAL: Will probably error since property may be undefined (Trying to access .module of undefined).
        if (this.aliases.get(name) !== undefined) {
            const commandPackg: CommandPackage | null = (this.commands.get(this.aliases.get(name) as string) as CommandPackage) || null;

            return commandPackg === null ? null : commandPackg.instance;
        }
        else if (this.isReleased(name)) {
            // TODO: Re-load command here.

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

    // TODO: Return amount registered instead.
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
     * Retrieve all the registered commands.
     */
    public getAll(): ReadonlyCommandMap {
        return this.commands as ReadonlyCommandMap;
    }

    /**
     * @return {number | null} The cooldown or null if there is none.
     */
    public getCooldown(user: Snowflake, command: string): number | null {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(user) || null;

        if (issuerCooldowns === null) {
            return null;
        }

        return issuerCooldowns.get(command) || null;
    }

    public cooldownExpired(user: Snowflake, command: string): boolean {
        const cooldown: number | null = this.getCooldown(user, command);

        return (cooldown !== null && Date.now() > cooldown) || cooldown === null;
    }

    /**
     * Removes a cooldown from a command.
     */
    public clearCooldown(user: Snowflake, command: string): boolean {
        const issuerCooldowns: Map<string, number> | null = this.cooldowns.get(user) || null;

        if (issuerCooldowns) {
            issuerCooldowns.delete(command);

            return true;
        }

        return false;
    }

    public setCooldown(user: Snowflake, cooldown: number, command: string): this {
        const currentCooldown: number | null = this.getCooldown(user, command);

        if (currentCooldown !== null) {
            // Must exist at this point.
            this.cooldowns.get(user)!.set(command, cooldown);

            return this;
        }

        const newCooldowns: Map<string, number> = new Map();

        newCooldowns.set(command, cooldown);
        this.cooldowns.set(user, newCooldowns);

        return this;
    }

    /**
     * Dispose all resources used by this class instance.
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
     * Unload all registered commands.
     */
    public unloadAll(): this {
        if (this.commands.size > 0) {
            const count: number = this.commands.size;

            this.commands.clear();
            Log.success(`Unloaded ${count} command(s)`);
        }

        return this;
    }

    /**
     * Emulate a command invocation.
     * @todo 'args' type on docs (here)
     * @param {string} base The base command name.
     * @param {Message} referer The triggering message.
     */
    public async invoke(base: string, referer: Message, ...args: string[]): Promise<any> {
        // Use any registered prefix, default to index 0.
        const content: string = `${this.bot.options.prefixes[0]}${base} ${args.join(" ")}`.trim();

        let command: Command | null = await CommandParser.parse(
            content,
            this,
            this.bot.options.prefixes
        );

        if (command === null) {
            throw Log.error(BotMessages.CMD_PARSE_FAIL);
        }

        command = command as Command;

        const rawArgs: RawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content, command.args),
            command,
            schema: command.args,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun.
            message: referer
        });

        // TODO: Debugging.
        // Log.debug("raw args, ", rawArgs);

        return this.bot.commandHandler.handle(
            this.bot.handle.createContext(referer),
            command,
            rawArgs
        );
    }
}
