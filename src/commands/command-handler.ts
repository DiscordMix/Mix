import Log from "../core/log";
import ChatEnvironment from "../core/chat-environment";
import Command from "./command";
import CommandStore, {CommandCooldown, CommandManagerEvent} from "./command-store";
import CommandContext from "./command-context";
import CommandExecutedEvent from "../events/command-executed-event";
import {TextChannel} from "discord.js";
import CommandAuthStore from "./auth-stores/command-auth-store";

export interface CommandHandlerOptions {
    readonly commandStore: CommandStore;
    readonly authStore: CommandAuthStore;
    readonly errorHandlers: Array<Function>;
    readonly argumentTypes: any;
}

export default class CommandHandler {
    readonly commandStore: CommandStore;
    readonly authStore: CommandAuthStore;
    readonly errorHandlers: Array<Function>;
    readonly argumentTypes: any;

    /**
     * @param {CommandHandlerOptions} options
     */
    constructor(options: CommandHandlerOptions) {
        /**
         * @type {CommandStore}
         * @readonly
         */
        this.commandStore = options.commandStore;

        /**
         * @type {CommandAuthStore}
         * @readonly
         */
        this.authStore = options.authStore;

        /**
         * @type {Array<Function>}
         * @readonly
         */
        this.errorHandlers = options.errorHandlers;

        /**
         * @type {Object}
         * @readonly
         */
        this.argumentTypes = options.argumentTypes;
    }

    /**
     * @param {CommandManagerEvent} event
     * @param {Function} handler
     * @return {CommandStore}
     */
    setErrorHandler(event: CommandManagerEvent, handler: Function): CommandHandler {
        this.errorHandlers[event] = handler;

        return this;
    }

    /**
     * @todo Split this method into a class
     * @todo Since it's returning a Promise, review
     * @param {CommandContext} context
     * @param {Command} command The command to handle
     * @param {*} api
     * @return {Promise<Boolean>} Whether the command was successfully executed
     */
    async handle(context: CommandContext, command: Command): Promise<boolean> {
        // TODO: Add a check for exclusions including:
        // #channelId, &roleId, @userId, $guildId

        if (!CommandHandler.validateEnvironment(command.environment, context.message.channel.type)) {
            if (this.errorHandlers[CommandManagerEvent.DisallowedEnvironment]) {
                this.errorHandlers[CommandManagerEvent.DisallowedEnvironment](context, command);
            }
            else {
                context.message.channel.send("That command may not be used here.");
            }
        }
        else if (!command.isEnabled) {
            if (this.errorHandlers[CommandManagerEvent.DisabledCommand]) {
                this.errorHandlers[CommandManagerEvent.DisabledCommand](context, command);
            }
            else {
                context.fail("That command is disabled and may not be used.");
            }
        }
        else if (command.specific.length > 0 && !CommandHandler.specificMet(command, context)) {
            context.fail("You are not allowed to use that command");
        }
        else if (!this.authStore.hasAuthority(context.message.guild.id, context.message, command.auth)) {
            if (this.errorHandlers[CommandManagerEvent.NoAuthority]) {
                this.errorHandlers[CommandManagerEvent.NoAuthority](context, command);
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
            if (this.errorHandlers[CommandManagerEvent.ArgumentAmountMismatch]) {
                this.errorHandlers[CommandManagerEvent.ArgumentAmountMismatch](context, command);
            }
            else if (command.maxArguments === command.minArguments) {
                context.fail(`That command only accepts **${command.maxArguments}** arguments.`);
            }
            else if (command.maxArguments > 0) {
                context.fail(`That command only accepts up to **${command.maxArguments}** and a minimum of **${command.minArguments}** arguments.`);
            }
            else {
                context.fail(`That command does not accept any arguments.`);
            }
        }
        else if ((typeof command.canExecute === "function" && !command.canExecute(context)) || typeof command.canExecute === "boolean" && !command.canExecute) {
            if (this.errorHandlers[CommandManagerEvent.CommandMayNotExecute]) {
                this.errorHandlers[CommandManagerEvent.CommandMayNotExecute](context, command);
            }
            else {
                context.fail("That command cannot be executed right now.");
            }
        }
        // TODO: CRITICAL Project no longer uses Typer.
        else if (false/* !command.singleArg /* && (!typer.validate(command.args, CommandHandler.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes)) */) {
            if (this.errorHandlers[CommandManagerEvent.InvalidArguments]) {
                this.errorHandlers[CommandManagerEvent.InvalidArguments](context, command);
            }
            else {
                context.fail("Invalid argument usage. Please use the `usage` command.");
            }
        }
        else if (command.selfPermissions.length > 0 && !context.message.guild.me.hasPermission(command.selfPermissions.map((permissionObj) => permissionObj.permission))) {
            if (this.errorHandlers[CommandManagerEvent.MissingSelfPermissions]) {
                this.errorHandlers[CommandManagerEvent.MissingSelfPermissions](context, command);
            }
            else {
                const permissions = command.selfPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`I need the following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.issuerPermissions.length > 0 && !context.message.member.hasPermission(command.issuerPermissions.map((permissionObj) => permissionObj.permission))) {
            if (this.errorHandlers[CommandManagerEvent.MissingIssuerPermissions]) {
                this.errorHandlers[CommandManagerEvent.MissingIssuerPermissions](context, command);
            }
            else {
                const permissions = command.issuerPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`You need to following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.cooldown && !this.commandStore.cooldownExpired(command)) {
            if (this.errorHandlers[CommandManagerEvent.UnderCooldown]) {
                this.errorHandlers[CommandManagerEvent.UnderCooldown](context, command);
            }
            else {
                const timeLeft: CommandCooldown | null = this.commandStore.getCooldown(command);

                if (timeLeft) {
                    context.fail(`You must wait **${(timeLeft.end - Date.now()) / 1000}** seconds before using that command again.`);
                }
                else {
                    Log.warn("[CommandStore.handle] Command cooldown returned null or undefined, this shouldn't happen");
                    context.fail("That command is under cooldown.");
                }
            }
        }
        else {
            try {
                // TODO: Only check if result is true, make sure commandStore return booleans
                // TODO: Bot should be accessed protected (from this class)
                const actualResult = command.executed(context, this.commandStore.bot.getAPI());
                const result: any = actualResult instanceof Promise ? await actualResult : actualResult;

                const commandCooldown: CommandCooldown = {
                    context: context,
                    command: command,

                    // TODO: User should be able to specify more than just seconds (maybe cooldown
                    // multiplier option?)
                    end: Date.now() + (command.cooldown * 1000)
                };

                const lastCooldown = this.commandStore.getCooldown(command);

                // Delete the last cooldown before adding the new one for this command + user
                if (lastCooldown) {
                    this.commandStore.cooldowns.splice(this.commandStore.cooldowns.indexOf(lastCooldown), 1);
                }

                this.commandStore.cooldowns.push(commandCooldown);
                context.bot.emit("commandExecuted", new CommandExecutedEvent(context, command), result);

                if (context.bot.autoDeleteCommands && context.message.deletable) {
                    await context.message.delete();
                }
                else if (context.bot.checkCommands && context.message.channel instanceof TextChannel) {
                    // TODO: Check if can add reaction
                    /* if (context.message.channel.permissionsFor(context.message.guild.me).has(Permissions.FLAGS.ADD_REACTIONS)) {

                    } */

                    context.message.react("✅");
                }

                return result;
            }
            catch (error) {
                if (this.errorHandlers[CommandManagerEvent.CommandError]) {
                    this.errorHandlers[CommandManagerEvent.CommandError](context, command, error);
                }
                else {
                    // TODO: Include stack trace
                    Log.error(`There was an error while executing the '${command.meta.name}' command: ${error.message}`);
                    context.fail(`There was an error executing that command. (${error.message})`);
                }
            }
        }

        return false;
    }

    static specificMet(command: Command, context: CommandContext): boolean {
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
                if (CommandHandler.validateChannelTypeEnv(environment, channelType)) {
                    return true;
                }
            }
        }
        else {
            return CommandHandler.validateChannelTypeEnv(environment, channelType);
        }

        return false;
    }

    /**
     * @param {Object} rules
     * @param {Array<string>} args
     * @return {Object} The assembled arguments
     */
    static assembleArguments(rules: any, args: Array<string>): any {
        const result: any = {};

        if (rules.length !== args.length) {
            Log.debug("AssembleArguments: Not same length");
        }

        for (let i = 0; i < rules.length; i++) {
            result[rules[i]] = (isNaN(parseInt(args[i])) ? args[i] : parseInt(args[i]));
        }

        return result;
    }
}
