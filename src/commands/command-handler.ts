import {GuildMember, Message, Snowflake, TextChannel} from "discord.js";
import {IAction} from "../actions/action";
import {BotEvent} from "../core/bot-extra";
import ChatEnv from "../core/chat-env";
import Log from "../core/log";
import Util from "../core/util";
import Command, {RawArguments, RestrictGroup} from "./command";
import Context from "./context";
import CommandParser from "./command-parser";
import CommandRegistry, {ICommandRegistry} from "./command-registry";
import {PromiseOr} from "@atlas/xlib";

/**
 * Represents events fired by the command handler.
 */
export enum CmdHandlerEvent {
    /**
     * The environment in which the command was executed was not allowed.
     */
    DisallowedEnvironment,

    /**
     * The command being executed is explicitly disabled.
     */
    DisabledCommand,

    /**
     * An invalid amount of arguments was provided.
     */
    ArgumentAmountMismatch,

    /**
     * The command's middlewares have determined that execution is not allowed.
     */
    CommandMayNotExecute,

    /**
     * The provided arguments were invalid.
     */
    InvalidArguments,

    /**
     * The bot is missing certain required permissions to continue command execution.
     */
    MissingSelfPermissions,

    /**
     * The command issuer is missing certain required permissions to continue command execution.
     */
    MissingIssuerPermissions,

    /**
     * There was an error while executing the command.
     */
    CommandError,

    /**
     * The command issuer does not have minimum required authority to execute the command.
     */
    NoAuthority,

    /**
     * The command issuer has not yet met the command's cooldown requirements.
     */
    UnderCooldown
}

export interface ICommandHandlerOptions {
    readonly commandStore: CommandRegistry;
    readonly errorHandlers: ICmdErrorHandlerOpt[];
}

export interface ICmdErrorHandlerOpt {
    readonly event: CmdHandlerEvent;
    readonly handler: CmdErrorHandler;
}

export type CmdErrorHandler = (context: Context, command: Command, error?: Error) => boolean;

export interface IUndoAction {
    readonly command: Command;
    readonly context: Context;
    readonly args?: any;
}

export interface ICommandHandler {
    readonly commandStore: ICommandRegistry;
    readonly errorHandlers: Map<CmdHandlerEvent, CmdErrorHandler>;
    readonly argumentTypes: any;
    readonly undoMemory: Map<Snowflake, IUndoAction>;

    undoAction(user: Snowflake, message: Message): PromiseOr<boolean>;
    handle(context: Context, command: Command, rawArgs: RawArguments): PromiseOr<boolean>;
}

/**
 * Handles incoming command requests.
 */
export default class CommandHandler implements ICommandHandler {
    public static specificMet(command: Command, context: Context): boolean {
        let met: boolean = false;

        for (const specific of command.constraints.specific) {
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
                        if (context.msg.member.roles.find("id", specific.substr(1, specific.length))) {
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
                // Override for bot owner.
                if (context.sender.id === context.bot.owner) {
                    met = true;

                    break;
                }

                switch (specific) {
                    case RestrictGroup.ServerOwner: {
                        const owners: Snowflake[] = context.msg.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_GUILD")).map((member: GuildMember) => member.id);

                        if (owners.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case RestrictGroup.ServerModerator: {
                        const moderators: Snowflake[] = context.msg.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_ROLES")).map((member: GuildMember) => member.id);

                        if (moderators.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case RestrictGroup.BotOwner: {
                        met = !Util.isEmpty(context.bot.owner) && context.sender.id === context.bot.owner;

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
                throw Log.error(`Invalid restrict group or prefix: ${specific}`);
            }

            if (met) {
                break;
            }
        }

        return met;
    }

    /**
     * Validates a channel's environment.
     * @return {boolean} Whether the environment is valid.
     */
    public static validateChannelTypeEnv(environment: ChatEnv, type: string, nsfw: boolean): boolean {
        if (environment === ChatEnv.Anywhere) {
            return true;
        }
        else if (environment === ChatEnv.Private && type === "dm") {
            return true;
        }
        else if (environment === ChatEnv.NSFW && type === "text") {
            return true;
        }
        else if (environment === ChatEnv.Guild && type === "text") {
            return true;
        }

        return false;
    }

    /**
     * Validates the execution environment.
     * @return {boolean} Whether the environment is valid.
     */
    public static validateEnv(environment: ChatEnv, channelType: string, nsfw: boolean): boolean {
        if (Array.isArray(environment)) {
            // TODO: CRITICAL: Pointless loop?
            for (const env of environment) {
                if (CommandHandler.validateChannelTypeEnv(environment, channelType, nsfw)) {
                    return true;
                }
            }
        }
        else {
            return CommandHandler.validateChannelTypeEnv(environment, channelType, nsfw);
        }

        return false;
    }

    public readonly commandStore: CommandRegistry;
    public readonly errorHandlers: Map<CmdHandlerEvent, CmdErrorHandler>;
    public readonly argumentTypes: any;
    public readonly undoMemory: Map<Snowflake, IUndoAction>;

    public constructor(options: ICommandHandlerOptions) {
        this.commandStore = options.commandStore;
        this.errorHandlers = new Map();

        // Populate error handlers with input.
        for (const opt of options.errorHandlers) {
            this.errorHandlers.set(opt.event, opt.handler);
        }

        this.undoMemory = new Map();
    }

    /**
     * Trigger a command's undo sequence.
     * @param {Snowflake} user The command issuer's ID.
     */
    public async undoAction(user: Snowflake, message: Message): Promise<boolean> {
        if (this.undoMemory.has(user)) {
            const action: IUndoAction = this.undoMemory.get(user)!;

            return await action.command.undo(action.context, message, action.args);
        }

        return false;
    }

    // TODO: Split this method into a class?
    // TODO: Since it's returning a Promise, review.
    /**
     * @param {Command} command The command to handle.
     * @return {Promise<boolean>} Whether the command was successfully executed.
     */
    public async handle(context: Context, command: Command, rawArgs: RawArguments): Promise<boolean> {
        if (!this.meetsRequirements(context, command, rawArgs)) {
            return false;
        }

        const resolvedArgs: any | null = CommandParser.resolveArguments({
            arguments: rawArgs,
            message: context.msg,
            resolvers: context.bot.argumentResolvers,
            schema: command.args
        });

        // Do not execute command if arguments failed to resolve.
        if (resolvedArgs === null) {
            Log.warn(`Command '${command.meta.name}' failed to execute: Failed to resolve arguments`);

            return false;
        }

        this.commandStore.bot.emit(BotEvent.HandlingCommand, context, command, resolvedArgs);

        try {
            // Process middleware before executing command.
            for (const guard of command.guards) {
                if (!guard(context, resolvedArgs, command)) {
                    // TODO: Upon failure, pass error to the corresponding handler.
                    return false;
                }
            }

            // TODO: Only check if result is true, make sure commandStore return booleans or actions?
            // TODO: Bot should be accessed protected (from this class).
            const rawResult: any = command.run(context, resolvedArgs);
            const result: any = rawResult instanceof Promise ? await rawResult : rawResult;

            // Actions.
            if (typeof result === "object" && result !== null) {
                const actions: IAction<any> = result;

                if (Array.isArray(actions)) {
                    await context.bot.actionInterpreter.interpretMany(actions);
                }
                else {
                    await context.bot.actionInterpreter.interpret(actions);
                }
            }

            const commandCooldown: number = Date.now() + (command.constraints.cooldown * 1000);
            const lastCooldown: number | null = this.commandStore.getCooldown(context.sender.id, command.meta.name);

            // Delete the last cooldown before adding the new one for this command + user.
            if (lastCooldown !== null) {
                if (!this.commandStore.clearCooldown(context.sender.id, command.meta.name)) {
                    throw Log.error(`Expecting cooldown of '${context.sender.id} (${context.sender.tag})' to exist for command '${command.meta.name}'`);
                }
            }

            this.commandStore.setCooldown(context.sender.id, commandCooldown, command.meta.name);

            // After successfully executing the command, invoke all it's relays.
            for (const connection of command.connections) {
                connection(context, resolvedArgs, command);
            }

            context.bot.emit(BotEvent.Command, command, context, result);

            if (context.bot.options.autoDeleteCommands && context.msg.deletable) {
                await context.msg.delete();
            }
            else if (context.bot.options.checkCommands && context.msg.channel instanceof TextChannel) {
                // TODO: Check if can add reaction.
                /* if (context.message.channel.permissionsFor(context.message.guild.me).has(Permissions.FLAGS.ADD_REACTIONS)) {

                } */

                context.msg.react("✅");
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
            this.commandStore.bot.emit(BotEvent.CommandError, error);

            const handler: CmdErrorHandler | undefined = this.errorHandlers.get(CmdHandlerEvent.CommandError);

            if (handler !== undefined) {
                handler(context, command, error);
            }
            else {
                // TODO: Include stack trace.
                Log.error(`There was an error while executing the '${command.meta.name}' command: ${error.message}`);
                context.fail(`There was an error executing that command. (${error.message})`);
            }
        }

        return false;
    }

    /**
     * @return {boolean} Whether the error was handled.
     */
    protected handleError(event: CmdHandlerEvent, context: Context, command: Command): boolean {
        if (this.errorHandlers.has(event)) {
            return this.errorHandlers.get(event)!(context, command);
        }

        return false;
    }

    /**
     * @param {Context} context
     * @param {Command} command
     * @param {IArgument[]} rawArgs
     * @return {boolean} Whether the environment and command issuer meet the command's requirements.
     */
    protected meetsRequirements(context: Context, command: Command, rawArgs: RawArguments): boolean {
        // TODO: Add a check for exclusions including:
        // #channelId, &roleId, @userId, $guildId

        if (!CommandHandler.validateEnv(
            command.constraints.environment,
            context.msg.channel.type,
            (context.msg.channel as any).nsfw || false)
        ) {
            if (!this.handleError(CmdHandlerEvent.DisallowedEnvironment, context, command)) {
                context.msg.channel.send("That command may not be used here.");
            }
        }
        else if (!command.isEnabled) {
            if (!this.handleError(CmdHandlerEvent.DisabledCommand, context, command)) {
                context.fail("That command is disabled and may not be used.");
            }
        }
        else if (command.constraints.specific.length > 0 && !CommandHandler.specificMet(command, context)) {
            context.fail("You're not allowed to use that command");
        }
        else if (!CommandParser.checkArguments({
            schema: command.args,
            arguments: rawArgs,
            message: context.msg,
            command
        })) {
            if (this.errorHandlers.has(CmdHandlerEvent.ArgumentAmountMismatch)) {
                this.errorHandlers.get(CmdHandlerEvent.ArgumentAmountMismatch)!(context, command);
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
            if (!this.handleError(CmdHandlerEvent.CommandMayNotExecute, context, command)) {
                context.fail("That command cannot be executed right now.");
            }
        }
        // TODO: CRITICAL Project no longer uses Typer. Is this already handled by checkArguments()?
        else if (false/* !command.singleArg /* && (!typer.validate(command.args, CommandHandler.assembleArguments(Object.keys(command.args), context.arguments), this.argumentTypes)) */) {
            if (this.errorHandlers.has(CmdHandlerEvent.InvalidArguments)) {
                this.errorHandlers.get(CmdHandlerEvent.InvalidArguments)!(context, command);
            }
            else {
                context.fail("Invalid argument usage. Please use the `usage` command.");
            }
        }
        else if (command.constraints.selfPermissions.length > 0 && !context.msg.guild.me.hasPermission(command.constraints.selfPermissions.map((permissionObj) => permissionObj.permission))) {
            if (!this.handleError(CmdHandlerEvent.MissingSelfPermissions, context, command)) {
                const permissions = command.constraints.selfPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`I require the following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.constraints.issuerPermissions.length > 0 && !context.msg.member.hasPermission(command.constraints.issuerPermissions.map((permissionObj) => permissionObj.permission))) {
            if (!this.handleError(CmdHandlerEvent.MissingIssuerPermissions, context, command)) {
                const permissions = command.constraints.issuerPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`You need to following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.constraints.cooldown && !this.commandStore.cooldownExpired(context.sender.id, command.meta.name)) {
            if (!this.handleError(CmdHandlerEvent.UnderCooldown, context, command)) {
                const timeLeft: number | null = this.commandStore.getCooldown(context.sender.id, command.meta.name);

                if (timeLeft) {
                    context.fail(`You must wait **${(timeLeft - Date.now()) / 1000}** seconds before using that command again.`);
                }
                else {
                    Log.warn("Command cooldown returned null or undefined, this shouldn't happen");
                    context.fail("That command is under cooldown.");
                }
            }
        }
        else {
            return true;
        }

        return false;
    }
}
