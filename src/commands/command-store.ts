import CommandExecutedEvent from "../events/command-executed-event";
import Log from "../core/log";
import ChatEnvironment from "../core/chat-environment";
import Bot from "../core/bot";
import Command from "./command";
import CommandAuthStore from "./auth-stores/command-auth-store";
import CommandContext from "./command-context";
import {Permissions, TextChannel} from "discord.js";
import Permission from "../core/permission";
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

export default class CommandStore /* extends Collection */ {
    readonly bot: Bot;
    readonly path: string;
    readonly authStore: CommandAuthStore;
    readonly argumentTypes: any;
    readonly cooldowns: Array<CommandCooldown>;

    commands: Array<Command>;

    /**
     * @param {Bot} bot
     * @param {string} path
     * @param {CommandAuthStore} authStore
     * @param {Object} argumentTypes
     */
    constructor(bot: Bot, path: string, authStore: CommandAuthStore, argumentTypes: any) {
        /**
         * @type {Bot}
         * @private
         * @readonly
         */
        this.bot = bot;

        /**
         * @type {string}
         * @private
         * @readonly
         */
        this.path = path;

        /**
         * @type {CommandAuthStore}
         * @private
         * @readonly
         */
        this.authStore = authStore;

        /**
         * @type {Array<Command>}
         * @private
         */
        this.commands = [];

        /**
         * @type {Array<CommandCooldown>}
         * @private
         */
        this.cooldowns = [];
    }

    /**
     * @param {Command} command
     */
    register(command: Command): void {
        this.commands.push(command);
    }

    /**
     * @param {string} commandBase
     * @return {boolean} Whether the command was removed
     */
    removeByBase(commandBase: string): boolean {
        const command = this.getByName(commandBase);

        if (command) {
            return this.remove(command);
        }

        return false;
    }

    /**
     * @param {Command} command
     * @return {boolean}
     */
    remove(command: Command): boolean {
        return this.removeAt(this.commands.indexOf(command));
    }

    /**
     * @param {number} index
     * @return {boolean}
     */
    removeAt(index: number): boolean {
        if (this.commands[index]) {
            this.commands.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * @param {string} commandBase
     * @return {boolean}
     */
    contains(commandBase: string): boolean {
        return this.getByName(commandBase) !== null;
    }

    /**
     * @param {Array<Command>} commands
     * @return {CommandStore}
     */
    registerMultiple(commands: Array<Command>): CommandStore {
        for (let i = 0; i < commands.length; i++) {
            this.register(commands[i]);
        }

        return this;
    }

    /**
     * @param {string} commandBase
     * @return {boolean}
     */
    isRegistered(commandBase: string): boolean {
        return this.getByName(commandBase) != null;
    }

    /**
     * @param {string} name
     * @return {(Command|null)}
     */
    getByName(name: string): Command | null {
        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i].name === name || this.commands[i].aliases.includes(name)) {
                return this.commands[i];
            }
        }

        return null;
    }

    /**
     * @param {Command} command
     * @return {CommandCooldown | null}
     */
    getCooldown(command: Command): CommandCooldown | null {
        for (let i: number = 0; i < this.cooldowns.length; i++) {
            if (this.cooldowns[i].command === command) {
                return this.cooldowns[i];
            }
        }

        return null;
    }

    /**
     * @param {CommandContext} context
     * @param {Command} command
     * @return {boolean}
     */
    cooldownExpired(context: CommandContext, command: Command): boolean {
        const cooldown: CommandCooldown | null = this.getCooldown(command);

        return (cooldown !== null && Date.now() > cooldown.end) || cooldown === null;
    }

    /**
     * Unload all commands
     */
    unloadAll(): void {
        if (this.commands.length > 0) {
            const count = this.commands.length;
            this.commands = [];
            Log.success(`[CommandManager.unloadAll] Unloaded ${count} command(s)`);
        }
    }
}
