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
 * @enum {Number}
 */
export enum CommandManagerEvent {
    DisallowedEnvironment,
    DisabledCommand,
    ArgumentAmountMismatch,
    CommandMayNotExecute,
    InvalidArguments,
    RequiresPermissions,
    CommandError
}

export default class CommandManager /* extends Collection */ {
    readonly bot: Bot;
    readonly path: string;
    readonly authStore: CommandAuthStore;
    readonly argumentTypes: any;
    readonly handlers: Array<Function>;

    commands: Array<Command>;

    /**
     * @param {Bot} bot
     * @param {String} path
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
         * @type {String}
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
    }

    /**
     * @param {Command} command
     */
    register(command: Command) {
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
     * @return {Boolean}
     */
    remove(command: Command): boolean {
        return this.removeAt(this.commands.indexOf(command));
    }

    /**
     * @param {Number} index
     * @return {Boolean}
     */
    removeAt(index: number): boolean {
        if (this.commands[index]) {
            this.commands.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * @param {String} commandBase
     * @return {Boolean}
     */
    contains(commandBase: string): boolean {
        return this.getByName(commandBase) !== null;
    }

    /**
     * @param {Array<Command>} commands
     */
    registerMultiple(commands: Array<Command>) {
        for (let i = 0; i < commands.length; i++) {
            this.register(commands[i]);
        }
    }

    /**
     * @param {String} commandBase
     * @return {Boolean}
     */
    isRegistered(commandBase: string): boolean {
        return this.getByName(commandBase) != null;
    }

    /**
     * @param {String} name
     * @return {(Command|Null)}
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
     * @param {Array<String>} args
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
     * @param {Command} command The command to handle
     * @return {Promise<Boolean>} Whether the command was successfully executed
     */
    async handle(context: CommandExecutionContext, command: Command): Promise<boolean> {
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
        // TODO: New AuthStore system
        /* else if (!this.authStore.hasAuthority(context.message.guild.id, context.message, command.auth)) {
            const minAuthority = AccessLevelType.toString(command.auth);

            context.fail(`You don't have the authority to use that command. You must be at least a(n) **${minAuthority}**.`);
        } */
        else if (context.arguments.length > command.maxArguments) {
            if (this.handlers[CommandManagerEvent.ArgumentAmountMismatch]) {
                this.handlers[CommandManagerEvent.ArgumentAmountMismatch](context, command);
            }
            else if (command.maxArguments > 0) {
                context.fail(`That command only accepts up to **${command.maxArguments}** arguments.`);
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
        else if (!Typer.validate(command.args, this.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes)) {
            if (this.handlers[CommandManagerEvent.InvalidArguments]) {
                this.handlers[CommandManagerEvent.InvalidArguments](context, command);
            }
            else {
                context.fail("Invalid argument usage. Please use the `usage` command.");
            }
        }
        else if (command.permissions.length > 0 && !context.message.guild.me.hasPermission(command.permissions.map((permissionObj) => permissionObj.permission))) {
            if (this.handlers[CommandManagerEvent.RequiresPermissions]) {
                this.handlers[CommandManagerEvent.RequiresPermissions](context, command);
            }
            else {
                const permissions = command.permissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`I need the following permission(s) to execute that command: ${permissions}`);
            }
        }
        else {
            try {
                const result = command.executed(context);

                context.bot.emit("commandExecuted", new CommandExecutedEvent(context, command));

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
    unloadAll() {
        if (this.commands.length > 0) {
            const count = this.commands.length;
            this.commands = [];
            Log.success(`[CommandManager.unloadAll] Unloaded ${count} command(s)`);
        }
    }

    /**
     * @private
     * @param {ChatEnvironment} environment
     * @param {String} type
     * @return {Boolean}
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
     * @param {String} channelType
     * @return {Boolean}
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
