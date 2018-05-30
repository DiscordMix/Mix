import CommandExecutedEvent from "../events/command-executed-event";
import Log from "../core/log";
import ChatEnvironment from "../core/chat-environment";
import CommandManagerEvent from "./command-manager-event";

const Typer = require("@raxor1234/typer/typer");
// import Collection from "../core/collection";

export default class CommandManager /* extends Collection */ {
    /**
     * @param {Bot} bot
     * @param {String} path
     * @param {CommandAuthStore} authStore
     * @param {Object} argumentTypes
     */
    constructor(bot, path, authStore, argumentTypes) {
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
         * @type {Array<*>}
         * @private
         */
        this.handlers = [];
    }

    /**
     * @param {Command} command
     */
    register(command) {
        this.commands.push(command);
    }

    /**
     * @param {String} commandBase
     * @returns {Boolean}
     */
    removeByBase(commandBase) {
        return this.remove(this.getByName(commandBase));
    }

    /**
     * @param {Command} command
     * @returns {Boolean}
     */
    remove(command) {
        return this.removeAt(this.commands.indexOf(command));
    }

    /**
     * @param {Number} index
     * @returns {Boolean}
     */
    removeAt(index) {
        if (this.commands[index]) {
            this.commands.splice(index, 1);

            return true;
        }

        return false;
    }

    /**
     * @param {String} commandBase
     * @returns {Boolean}
     */
    contains(commandBase) {
        return this.getByName(commandBase) !== null;
    }

    /**
     * @param {Array<Command>} commands
     */
    registerMultiple(commands) {
        for (let i = 0; i < commands.length; i++) {
            this.register(commands[i]);
        }
    }

    /**
     * @param {String} commandBase
     * @returns {Boolean}
     */
    isRegistered(commandBase) {
        return this.getByName(commandBase) != null;
    }

    /**
     * @param {String} name
     * @returns {(Command|Null)}
     */
    getByName(name) {
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
     * @returns {Object} The assembled arguments
     */
    assembleArguments(rules, args) {
        const result = {};

        if (rules.length !== args.length) {
            Log.debug("AssembleArguments: Not same length");
        }

        for (let i = 0; i < rules.length; i++) {
            result[rules[i]] = (isNaN(args[i]) ? args[i] : parseInt(args[i]));
        }

        return result;
    }

    /**
     * @param {CommandManagerEvent} event
     * @param {Function} handler
     * @return {CommandManager}
     */
    setEventHandler(event, handler) {
        this.handlers[event] = handler;

        return this;
    }

    /**
     * @param {CommandExecutionContext} context
     * @param {Command} command The command to handle
     * @returns {Promise<Boolean>} Whether the command was successfully executed
     */
    async handle(context, command) {
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
        else if (command.canExecute !== null && !command.canExecute(context)) {
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

                context.bot.emit("commandExecuted", new CommandExecutedEvent(command, context));

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
     * @returns {Boolean}
     */
    static validateChannelTypeEnv(environment, type) {
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
     * @returns {Boolean}
     */
    static validateEnvironment(environment, channelType) {
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
