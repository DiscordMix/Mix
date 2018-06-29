import CommandExecutedEvent from "../events/command-executed-event";
import Log from "../core/log";
import ChatEnvironment from "../core/chat-environment";
import Bot from "../core/bot";
import Command from "./command";
import CommandAuthStore from "./command-auth-store";
import CommandExecutionContext from "./command-execution-context";

const Typer = require("@raxor1234/typer/typer");
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
    readonly context: CommandExecutionContext;
    readonly command: Command;
    readonly end: number;
}

export default class CommandManager /* extends Collection */ {
    readonly bot: Bot;
    readonly path: string;
    readonly authStore: CommandAuthStore;
    readonly argumentTypes: any;
    readonly handlers: Array<Function>;
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
         * @type {Object}
         * @readonly
         */
        this.argumentTypes = argumentTypes;

        /**
         * @type {Array<Command>}
         * @private
         */
        this.commands = [];

        /**
         * @type {Array<Function>}
         * @private
         */
        this.handlers = [];

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
     * @return {CommandManager}
     */
    registerMultiple(commands: Array<Command>): CommandManager {
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
     * @param {Object} rules
     * @param {Array<string>} args
     * @return {Object} The assembled arguments
     */
    assembleArguments(rules: any, args: Array<string>): any {
        const result: any = {};

        if (rules.length !== args.length) {
            Log.debug("AssembleArguments: Not same length");
        }

        for (let i = 0; i < rules.length; i++) {
            result[rules[i]] = (isNaN(parseInt(args[i])) ? args[i] : parseInt(args[i]));
        }

        return result;
    }

    /**
     * @param {CommandManagerEvent} event
     * @param {Function} handler
     * @return {CommandManager}
     */
    setEventHandler(event: CommandManagerEvent, handler: Function): CommandManager {
        this.handlers[event] = handler;

        return this;
    }

    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command
     * @return {CommandCooldown | null}
     */
    getCooldown(context: CommandExecutionContext, command: Command): CommandCooldown | null {
        for (let i: number = 0; i < this.cooldowns.length; i++) {
            if (this.cooldowns[i].context === context && this.cooldowns[i].command === command) {
                return this.cooldowns[i];
            }
        }

        return null;
    }

    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command
     * @return {boolean}
     */
    cooldownExpired(context: CommandExecutionContext, command: Command): boolean {
        const cooldown = this.getCooldown(context, command);

        return cooldown !== null && Date.now() > cooldown.end || cooldown === null;
    }

    /**
     * @todo Since it's returning a Promise, review
     * @param {CommandExecutionContext} context
     * @param {Command} command The command to handle
     * @return {Promise<Boolean>} Whether the command was successfully executed
     */
    async handle(context: CommandExecutionContext, command: Command): Promise<boolean> {
        // TODO: Add a check for exclusions including:
        // #channelId, &roleId, @userId, $guildId

        if (!CommandManager.validateEnvironment(command.environment, context.message.channel.type)) {
            if (this.handlers[CommandManagerEvent.DisallowedEnvironment]) {
                this.handlers[CommandManagerEvent.DisallowedEnvironment](context, command);
            }
            else {
                context.message.channel.send("That command may not be used here.");
            }
        }
        else if (!command.isEnabled) {
            if (this.handlers[CommandManagerEvent.DisabledCommand]) {
                this.handlers[CommandManagerEvent.DisabledCommand](context, command);
            }
            else {
                context.fail("That command is disabled and may not be used.");
            }
        }
        else if (command.specific.length > 0 && !CommandManager.specificMet(command, context)) {
            context.fail("You are not allowed to use that command");
        }
        else if (!this.authStore.hasAuthority(context.message.guild.id, context.message, command.auth)) {
            if (this.handlers[CommandManagerEvent.NoAuthority]) {
                this.handlers[CommandManagerEvent.NoAuthority](context, command);
            }
            else {
                const minAuthority = this.authStore.getSchemaRankName(command.auth);

                let rankName = "Unknown"; // TODO: Unknown should be a reserved auth level name (schema)

                if (minAuthority !== null) {
                    rankName = minAuthority.charAt(0).toUpperCase() + minAuthority.slice(1);
                }

                context.fail(`You don't have the authority to use that command. You must be at least a(n) **${rankName}**.`);
            }
        }
        else if (!command.singleArg && (context.arguments.length > command.maxArguments || context.arguments.length < command.minArguments)) {
            if (this.handlers[CommandManagerEvent.ArgumentAmountMismatch]) {
                this.handlers[CommandManagerEvent.ArgumentAmountMismatch](context, command);
            }
            else if (command.maxArguments > 0) {
                context.fail(`That command only accepts up to **${command.maxArguments}** and a minimum of **${command.minArguments}** arguments.`);
            }
            else {
                context.fail(`That command does not accept any arguments.`);
            }
        }
        else if ((typeof command.canExecute === "function" && !command.canExecute(context)) || typeof command.canExecute === "boolean" && !command.canExecute) {
            if (this.handlers[CommandManagerEvent.CommandMayNotExecute]) {
                this.handlers[CommandManagerEvent.CommandMayNotExecute](context, command);
            }
            else {
                context.fail("That command cannot be executed right now.");
            }
        }
        else if (!command.singleArg && (!Typer.validate(command.args, this.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes))) {
            if (this.handlers[CommandManagerEvent.InvalidArguments]) {
                this.handlers[CommandManagerEvent.InvalidArguments](context, command);
            }
            else {
                context.fail("Invalid argument usage. Please use the `usage` command.");
            }
        }
        else if (command.selfPermissions.length > 0 && !context.message.guild.me.hasPermission(command.selfPermissions.map((permissionObj) => permissionObj.permission))) {
            if (this.handlers[CommandManagerEvent.MissingSelfPermissions]) {
                this.handlers[CommandManagerEvent.MissingSelfPermissions](context, command);
            }
            else {
                const permissions = command.selfPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`I need the following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.issuerPermissions.length > 0 && !context.message.member.hasPermission(command.issuerPermissions.map((permissionObj) => permissionObj.permission))) {
            if (this.handlers[CommandManagerEvent.MissingIssuerPermissions]) {
                this.handlers[CommandManagerEvent.MissingIssuerPermissions](context, command);
            }
            else {
                const permissions = command.issuerPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`You need to following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.cooldown && !this.cooldownExpired(context, command)) {
            if (this.handlers[CommandManagerEvent.UnderCooldown]) {
                this.handlers[CommandManagerEvent.UnderCooldown](context, command);
            }
            else {
                // TODO
                const timeLeft = "TODO";

                context.fail(`You must wait ${timeLeft} more seconds before using that command again.`);
            }
        }
        else {
            try {
                const result: any = command.executed(context, this.bot.api);

                const commandCooldown: CommandCooldown = {
                    context: context,
                    command: command,

                    // TODO: User should be able to specify more than just seconds (maybe cooldown
                    // multiplier option?)
                    end: Date.now() + (command.cooldown * 1000)
                };

                const lastCooldown = this.getCooldown(context, command);

                // Delete the last cooldown before adding the new one for this command + user
                if (lastCooldown) {
                    this.cooldowns.splice(this.cooldowns.indexOf(lastCooldown), 1);
                }

                this.cooldowns.push(commandCooldown);
                context.bot.emit("commandExecuted", new CommandExecutedEvent(context, command), result);

                if (context.bot.autoDeleteCommands && context.message.deletable) {
                    context.message.delete();
                }

                return result;
            }
            catch (error) {
                if (this.handlers[CommandManagerEvent.CommandError]) {
                    this.handlers[CommandManagerEvent.CommandError](context, command, error);
                }
                else {
                    // TODO: Include stack trace
                    Log.error(`There was an error while executing the ${command.name} command: ${error.message}`);
                    context.fail(`There was an error executing that command. (${error.message})`);
                }
            }
        }

        return false;
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

    static specificMet(command: Command, context: CommandExecutionContext): boolean {
        let met = false;

        for (let i = 0; i < command.specific.length; i++) {
            switch (command.specific[i][0]) {
                case "@": {
                    if (context.sender.id === command.specific[i].substring(1)) {
                        met = true;
                    }

                    break;
                }

                case "&": {
                    if (context.message.member.roles.find("id", command.specific[i].substr(1, command.specific[i].length))) {
                        met = true;
                    }

                    break;
                }

                default: {
                    Log.error(`[CommandManager.specificMet] Invalid specific prefix: ${command.specific[0]}`)
                }
            }

            if (met) {
                break;
            }
        }

        return met;
    }

    /**
     * @private
     * @param {ChatEnvironment} environment
     * @param {string} type
     * @return {boolean}
     */
    static validateChannelTypeEnv(environment: ChatEnvironment, type: string): boolean {
        if (environment === ChatEnvironment.Anywhere) {
            return true;
        }
        else if (environment === ChatEnvironment.Private && type === "dm") {
            return true;
        }
        else if (environment === ChatEnvironment.Guild && type === "text") {
            return true;
        }

        return false;
    }

    /**
     * @param {ChatEnvironment|Array<ChatEnvironment>} environment
     * @param {string} channelType
     * @return {boolean}
     */
    static validateEnvironment(environment: ChatEnvironment, channelType: string): boolean {
        if (Array.isArray(environment)) {
            for (let i = 0; i < environment.length; i++) {
                if (CommandManager.validateChannelTypeEnv(environment, channelType)) {
                    return true;
                }
            }
        }
        else {
            return CommandManager.validateChannelTypeEnv(environment, channelType);
        }

        return false;
    }
}
