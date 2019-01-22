import {GuildMember, Message, Snowflake, TextChannel} from "discord.js";
import {IAction} from "../actions/action";
import {BotEvent} from "../core/bot-extra";
import DiscordChatEnv from "../core/discord-chat-env";
import Log from "../logging/log";
import Util from "../core/util";
import Command, {RawArguments, RestrictGroup} from "./command";
import DiscordContext, {IContext} from "./command-context";
import CommandParser from "./command-parser";
import {ICommandRegistry} from "./command-registry";
import {PromiseOr} from "@atlas/xlib";

export enum CmdHandlerEvent {
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

export interface ICommandHandlerOpts {
    readonly registry: ICommandRegistry;
    readonly errorHandlers: ICmdErrorHandlerOpt[];
    readonly argumentTypes: any;
}

export interface ICmdErrorHandlerOpt {
    readonly event: CmdHandlerEvent;
    readonly handler: CmdErrorHandler;
}

export type CmdErrorHandler = (context: DiscordContext, command: Command, error?: Error) => boolean;

export interface IUndoAction {
    readonly command: Command;
    readonly context: DiscordContext;
    readonly args?: any;
}

export interface ICommandHandler {
    readonly registry: ICommandRegistry;
    readonly errorHandlers: Map<CmdHandlerEvent, CmdErrorHandler>;
    readonly argumentTypes: any;
    readonly undoMemory: Map<Snowflake, IUndoAction>;

    undoAction(user: Snowflake, message: Message): PromiseOr<boolean>;
    handle(context: DiscordContext, command: Command, rawArgs: RawArguments): PromiseOr<boolean>;
}

export default class CommandHandler implements ICommandHandler {
    public readonly registry: ICommandRegistry;
    public readonly errorHandlers: Map<CmdHandlerEvent, CmdErrorHandler>;
    public readonly argumentTypes: any;
    public readonly undoMemory: Map<Snowflake, IUndoAction>;

    /**
     * @param {ICommandHandlerOpts} options
     */
    public constructor(options: ICommandHandlerOpts) {
        /**
         * @type {ICommandRegistry}
         * @readonly
         */
        this.registry = options.registry;

        /**
         * @type {Function[]}
         * @readonly
         */
        this.errorHandlers = new Map();

        // Populate error handlers with input
        for (const opt of options.errorHandlers) {
            this.errorHandlers.set(opt.event, opt.handler);
        }

        /**
         * @type {*}
         * @readonly
         */
        this.argumentTypes = options.argumentTypes;

        /**
         * @type {Map<Snowflake, IUndoAction>}
         * @readonly
         */
        this.undoMemory = new Map();
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
     * @param {DiscordContext} context
     * @param {Command} command The command to handle
     * @param {RawArguments} rawArgs
     * @return {Promise<boolean>} Whether the command was successfully executed
     */
    public async handle(context: IContext, command: Command, rawArgs: RawArguments): Promise<boolean> {
        const resolvedArgs: any | null = CommandParser.resolveArguments({
            arguments: rawArgs,
            message: context.msg,
            resolvers: context.bot.argumentResolvers,
            schema: command.args
        });

        // Do not execute command if arguments failed to resolve
        if (resolvedArgs === null) {
            Log.warn(`Command '${command.meta.name}' failed to execute: Failed to resolve arguments`);

            return false;
        }

        this.registry.bot.emit("handlingCommand", context, command, resolvedArgs);

        try {
            // Process middleware before executing command
            for (const guard of command.guards) {
                if (!guard(context, resolvedArgs, command)) {
                    // TODO: Upon failure, pass error to the corresponding handler
                    return false;
                }
            }

            // TODO: Only check if result is true, make sure commandStore return booleans or actions?
            // TODO: Bot should be accessed protected (from this class)
            const rawResult: any = command.run(context, resolvedArgs);
            const result: any = rawResult instanceof Promise ? await rawResult : rawResult;

            // Actions
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
            const lastCooldown: number | null = this.registry.getCooldown(context.sender.id, command.meta.name);

            // Delete the last cooldown before adding the new one for this command + user
            if (lastCooldown !== null) {
                if (!this.registry.clearCooldown(context.sender.id, command.meta.name)) {
                    throw Log.error(`Expecting cooldown of '${context.sender.id} (${context.sender.tag})' to exist for command '${command.meta.name}'`);
                }
            }

            this.registry.setCooldown(context.sender.id, commandCooldown, command.meta.name);

            // After successfully executing the command, invoke all it's relays
            for (const connection of command.connections) {
                connection(context, resolvedArgs, command);
            }

            context.bot.emit(BotEvent.Command, command, context, result);

            if (context.bot.extraOpts.autoDeleteCommands && context.msg.deletable) {
                await context.msg.delete();
            }
            else if (context.bot.extraOpts.checkCommands && context.msg.channel instanceof TextChannel) {
                // TODO: Check if can add reaction
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
            this.registry.bot.emit("commandError", error);

            const handler: CmdErrorHandler | undefined = this.errorHandlers.get(CmdHandlerEvent.CommandError);

            if (handler !== undefined) {
                handler(context, command, error);
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
     * @param {CmdHandlerEvent} event
     * @param {DiscordContext} context
     * @param {Command} command
     * @return {boolean}
     */
    protected handleError(event: CmdHandlerEvent, context: DiscordContext, command: Command): boolean {
        if (this.errorHandlers.has(event)) {
            return (this.errorHandlers.get(event) as CmdErrorHandler)(context, command);
        }

        return false;
    }

    /**
     * @param {DiscordContext} context
     * @param {Command} command
     * @param {IArgument[]} rawArgs
     * @return {boolean}
     */
    protected meetsRequirements(context: DiscordContext, command: Command, rawArgs: RawArguments): boolean {
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
            types: context.bot.argumentTypes,
            command
        })) {
            if (this.errorHandlers.has(CmdHandlerEvent.ArgumentAmountMismatch)) {
                (this.errorHandlers.get(CmdHandlerEvent.ArgumentAmountMismatch) as CmdErrorHandler)(context, command);
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
                (this.errorHandlers.get(CmdHandlerEvent.InvalidArguments) as CmdErrorHandler)(context, command);
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
        else if (command.constraints.cooldown && !this.registry.hasCooldownExpired(context.sender.id, command.meta.name)) {
            if (!this.handleError(CmdHandlerEvent.UnderCooldown, context, command)) {
                const timeLeft: number | null = this.registry.getCooldown(context.sender.id, command.meta.name);

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
