import Log from "../core/log";
import ChatEnvironment from "../core/chat-environment";
import Command, {RestrictGroup, IRawArguments} from "./command";
import CommandStore, {CommandManagerEvent} from "./command-store";
import CommandContext from "./command-context";
import {GuildMember, Snowflake, TextChannel, Message} from "discord.js";
import CommandParser from "./command-parser";
import Utils from "../core/utils";

export type ICommandHandlerOptions = {
    readonly commandStore: CommandStore;
    readonly errorHandlers: Function[];
    readonly argumentTypes: any;
}

export type ICommandErrorHandler = (context: CommandContext, command: Command) => boolean;

export type IUndoAction = {
    readonly command: Command;
    readonly context: CommandContext;
    readonly args?: any;
}

export default class CommandHandler {
    public readonly commandStore: CommandStore;
    public readonly errorHandlers: Function[];
    public readonly _errorHandlers: Map<CommandManagerEvent, any>;
    public readonly argumentTypes: any;
    public readonly undoMemory: Map<Snowflake, IUndoAction>;

    /**
     * @todo Replace 'errorHandlers' with '_errorHandlers'
     * @param {ICommandHandlerOptions} options
     */
    constructor(options: ICommandHandlerOptions) {
        /**
         * @type {CommandStore}
         * @readonly
         */
        this.commandStore = options.commandStore;

        /**
         * @type {Function[]}
         * @readonly
         */
        this.errorHandlers = options.errorHandlers;

        /**
         * @type {*}
         * @readonly
         */
        this.argumentTypes = options.argumentTypes;

        /**
         * @type {Map<CommandManagerEvent, *>}
         * @readonly
         */
        this._errorHandlers = new Map();

        /**
         * @type {Map<Snowflake, IUndoAction>}
         * @readonly
         */
        this.undoMemory = new Map();
    }

    private handleError(event: CommandManagerEvent, context: CommandContext, command: Command): boolean {
        if (this._errorHandlers.get(event) !== undefined) {
            return this._errorHandlers.get(event)(context, command);
        }

        return false;
    }

    /**
     * @param {CommandContext} context
     * @param {Command} command
     * @param {IArgument[]} rawArgs
     * @return {boolean}
     */
    private meetsRequirements(context: CommandContext, command: Command, rawArgs: IRawArguments): boolean {
        // TODO: Add a check for exclusions including:
        // #channelId, &roleId, @userId, $guildId

        if (!CommandHandler.validateEnvironment(command.restrict.environment, context.message.channel.type)) {
            if (!this.handleError(CommandManagerEvent.DisallowedEnvironment, context, command)) {
                context.message.channel.send("That command may not be used here.");
            }
        }
        else if (!command.isEnabled) {
            if (!this.handleError(CommandManagerEvent.DisabledCommand, context, command)) {
                context.fail("That command is disabled and may not be used.");
            }
        }
        else if (command.restrict.specific.length > 0 && !CommandHandler.specificMet(command, context)) {
            context.fail("You're not allowed to use that command");
        }
        else if (!CommandParser.checkArguments({
            schema: command.arguments,
            arguments: rawArgs,
            message: context.message,
            types: context.bot.argumentTypes,
            command: command
        })) {
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
            if (!this.handleError(CommandManagerEvent.CommandMayNotExecute, context, command)) {
                context.fail("That command cannot be executed right now.");
            }
        }
        // TODO: CRITICAL Project no longer uses Typer. Is this already handled by checkArguments()?
        else if (false/* !command.singleArg /* && (!typer.validate(command.args, CommandHandler.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes)) */) {
            if (this.errorHandlers[CommandManagerEvent.InvalidArguments]) {
                this.errorHandlers[CommandManagerEvent.InvalidArguments](context, command);
            }
            else {
                context.fail("Invalid argument usage. Please use the `usage` command.");
            }
        }
        else if (command.restrict.selfPermissions.length > 0 && !context.message.guild.me.hasPermission(command.restrict.selfPermissions.map((permissionObj) => permissionObj.permission))) {
            if (!this.handleError(CommandManagerEvent.MissingSelfPermissions, context, command)) {
                const permissions = command.restrict.selfPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`I require the following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.restrict.issuerPermissions.length > 0 && !context.message.member.hasPermission(command.restrict.issuerPermissions.map((permissionObj) => permissionObj.permission))) {
            if (!this.handleError(CommandManagerEvent.MissingIssuerPermissions, context, command)) {
                const permissions = command.restrict.issuerPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`You need to following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.restrict.cooldown && !this.commandStore.cooldownExpired(context.sender.id, command.meta.name)) {
            if (!this.handleError(CommandManagerEvent.UnderCooldown, context, command)) {
                const timeLeft: number | null = this.commandStore.getCooldown(context.sender.id, command.meta.name);

                if (timeLeft) {
                    context.fail(`You must wait **${(timeLeft - Date.now()) / 1000}** seconds before using that command again.`);
                }
                else {
                    Log.warn("[CommandStore.handle] Command cooldown returned null or undefined, this shouldn't happen");
                    context.fail("That command is under cooldown.");
                }
            }
        }
        else {
            return true;
        }

        return false;
    }

    /**
     * @param {Snowflake} user
     * @param {Message} message
     */
    public async undoAction(user: Snowflake, message: Message): Promise<boolean> {
        if (this.undoMemory.has(user)) {
            const action: IUndoAction = this.undoMemory.get(user) as IUndoAction;

            return await action.command.undo(action.context, message, action.args);
        }

        return false;
    }

    /**
     * @todo Split this method into a class?
     * @todo Since it's returning a Promise, review
     * @param {CommandContext} context
     * @param {Command} command The command to handle
     * @param {IRawArguments} rawArgs
     * @return {Promise<boolean>} Whether the command was successfully executed
     */
    public async handle(context: CommandContext, command: Command, rawArgs: IRawArguments): Promise<boolean> {
        if (!this.meetsRequirements(context, command, rawArgs)) {
            return false;
        }

        const resolvedArgs: any | null = CommandParser.resolveArguments({
            arguments: rawArgs,
            message: context.message,
            resolvers: context.bot.argumentResolvers,
            schema: command.arguments
        });

        // Do not execute command if arguments failed to resolve
        if (resolvedArgs === null) {
            Log.warn(`[CommandHandler.handle] Command '${command.meta.name}' failed to execute: Failed to resolve arguments`);

            return false;
        }

        this.commandStore.bot.emit("handlingCommand", context, command, resolvedArgs);

        try {
            // TODO: Only check if result is true, make sure commandStore return booleans
            // TODO: Bot should be accessed protected (from this class)
            const actualResult: any = command.executed(context, resolvedArgs, context.bot.getAPI());
            const result: any = actualResult instanceof Promise ? await actualResult : actualResult;
            const commandCooldown: number = Date.now() + (command.restrict.cooldown * 1000);
            const lastCooldown: number | null = this.commandStore.getCooldown(context.sender.id, command.meta.name);

            // Delete the last cooldown before adding the new one for this command + user
            if (lastCooldown !== null) {
                if (!this.commandStore.clearCooldown(context.sender.id, command.meta.name)) {
                    Log.error(`[CommandHandler.handle] Expecting cooldown of '${context.sender.id} (${context.sender.tag})' to exist for command '${command.meta.name}'`);
                }
            }

            this.commandStore.setCooldown(context.sender.id, commandCooldown, command.meta.name);

            context.bot.emit("commandExecuted", {
                context,
                command
            }, result);

            if (context.bot.options.autoDeleteCommands && context.message.deletable) {
                await context.message.delete();
            }
            else if (context.bot.options.checkCommands && context.message.channel instanceof TextChannel) {
                // TODO: Check if can add reaction
                /* if (context.message.channel.permissionsFor(context.message.guild.me).has(Permissions.FLAGS.ADD_REACTIONS)) {

                } */

                context.message.react("✅");
            }

            if (command.undoable) {
                this.undoMemory.set(context.sender.id, {
                    command,
                    context,
                    args: resolvedArgs
                });
            }

            return result;
        }
        catch (error) {
            this.commandStore.bot.emit("commandError", error);

            if (this.errorHandlers[CommandManagerEvent.CommandError]) {
                this.errorHandlers[CommandManagerEvent.CommandError](context, command, error);
            }
            else {
                // TODO: Include stack trace
                Log.error(`There was an error while executing the '${command.meta.name}' command: ${error.message}`);
                context.fail(`There was an error executing that command. (${error.message})`);
            }
        }

        return false;
    }

    /**
     * @param {Command} command
     * @param {CommandContext} context
     * @return {boolean}
     */
    public static specificMet(command: Command, context: CommandContext): boolean {
        let met = false;

        for (let i = 0; i < command.restrict.specific.length; i++) {
            let specific: string | RestrictGroup = command.restrict.specific[i];

            let valid: boolean = true;

            if (typeof specific === "string" && (specific.startsWith("@") || specific.startsWith("&"))) {
                switch (specific[0]) {
                    case "@": {
                        if (context.sender.id === specific.substring(1)) {
                            met = true;
                        }

                        break;
                    }

                    case "&": {
                        if (context.message.member.roles.find("id", specific.substr(1, specific.length))) {
                            met = true;
                        }

                        break;
                    }

                    default: {
                        valid = false;
                    }
                }
            }
            else if (typeof specific === "number" && RestrictGroup[specific] !== undefined) {
                // Override for bot owner
                if (context.sender.id === context.bot.owner) {
                    met = true;

                    break;
                }

                switch (specific) {
                    case RestrictGroup.ServerOwner: {
                        const owners: Snowflake[] = context.message.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_GUILD")).map((member: GuildMember) => member.id);

                        if (owners.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case RestrictGroup.ServerModerator: {
                        const moderators: Snowflake[] = context.message.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_ROLES")).map((member: GuildMember) => member.id);

                        if (moderators.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case RestrictGroup.BotOwner: {
                        met = !Utils.isEmpty(context.bot.owner) && context.sender.id === context.bot.owner;

                        break;
                    }

                    default: {
                        valid = false;
                    }
                }
            }
            else {
                valid = false;
            }

            if (!valid) {
                Log.debug(RestrictGroup, RestrictGroup[specific]);
                Log.error(`[CommandManager.specificMet] Invalid restrict group or prefix: ${specific}`)
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
    public static validateChannelTypeEnv(environment: ChatEnvironment, type: string): boolean {
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
     * @param {ChatEnvironment|ChatEnvironment[]} environment
     * @param {string} channelType
     * @return {boolean}
     */
    public static validateEnvironment(environment: ChatEnvironment, channelType: string): boolean {
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
}
