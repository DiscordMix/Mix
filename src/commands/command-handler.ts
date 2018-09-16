import Log from "../core/log";
import ChatEnvironment from "../core/chat-environment";
import Command, {CommandArgument, CommandRestrictGroup, RawArguments} from "./command";
import CommandStore, {CommandCooldown, CommandManagerEvent} from "./command-store";
import CommandContext from "./command-context";
import CommandExecutedEvent from "../events/command-executed-event";
import {GuildMember, Snowflake, TextChannel} from "discord.js";
import CommandAuthStore from "./auth-stores/command-auth-store";
import CommandParser from "./command-parser";

export interface CommandHandlerOptions {
    readonly commandStore: CommandStore;
    readonly authStore: CommandAuthStore;
    readonly errorHandlers: Array<Function>;
    readonly argumentTypes: any;
}

export default class CommandHandler {
    public readonly commandStore: CommandStore;
    public readonly authStore: CommandAuthStore;
    public readonly errorHandlers: Array<Function>;
    public readonly argumentTypes: any;

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
    public setErrorHandler(event: CommandManagerEvent, handler: Function): CommandHandler {
        this.errorHandlers[event] = handler;

        return this;
    }

    /**
     * @param {CommandContext} context
     * @param {Command} command
     * @param {Array<CommandArgument>} rawArgs
     * @return {boolean}
     */
    private meetsRequirements(context: CommandContext, command: Command, rawArgs: Array<string>): boolean {
        // TODO: Add a check for exclusions including:
        // #channelId, &roleId, @userId, $guildId

        if (!CommandHandler.validateEnvironment(command.restrict.environment, context.message.channel.type)) {
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
        else if (command.restrict.specific.length > 0 && !CommandHandler.specificMet(command, context)) {
            context.fail("You're not allowed to use that command");
        }
        else if (!this.authStore.hasAuthority(context.message.guild.id, context.message, command.restrict.auth, context.bot.owner)) {
            if (this.errorHandlers[CommandManagerEvent.NoAuthority]) {
                this.errorHandlers[CommandManagerEvent.NoAuthority](context, command);
            }
            else {
                const minAuthority = this.authStore.getSchemaRankName(command.restrict.auth);

                let rankName: string = "Unknown"; // TODO: Unknown should be a reserved auth level name (schema)

                if (minAuthority !== null) {
                    rankName = minAuthority.charAt(0).toUpperCase() + minAuthority.slice(1);
                }

                context.fail(`You don't have the authority to use that command. You must be at least a(n) **${rankName}**.`);
            }
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
            if (this.errorHandlers[CommandManagerEvent.CommandMayNotExecute]) {
                this.errorHandlers[CommandManagerEvent.CommandMayNotExecute](context, command);
            }
            else {
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
            if (this.errorHandlers[CommandManagerEvent.MissingSelfPermissions]) {
                this.errorHandlers[CommandManagerEvent.MissingSelfPermissions](context, command);
            }
            else {
                const permissions = command.restrict.selfPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`I need the following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.restrict.issuerPermissions.length > 0 && !context.message.member.hasPermission(command.restrict.issuerPermissions.map((permissionObj) => permissionObj.permission))) {
            if (this.errorHandlers[CommandManagerEvent.MissingIssuerPermissions]) {
                this.errorHandlers[CommandManagerEvent.MissingIssuerPermissions](context, command);
            }
            else {
                const permissions = command.restrict.issuerPermissions.map((permission) => `\`${permission.name}\``).join(", ");

                context.fail(`You need to following permission(s) to execute that command: ${permissions}`);
            }
        }
        else if (command.restrict.cooldown && !this.commandStore.cooldownExpired(command)) {
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
            return true;
        }

        return false;
    }

    /**
     * @todo Split this method into a class
     * @todo Since it's returning a Promise, review
     * @param {CommandContext} context
     * @param {Command} command The command to handle
     * @param {RawArguments} rawArgs
     * @return {Promise<Boolean>} Whether the command was successfully executed
     */
    public async handle(context: CommandContext, command: Command, rawArgs: RawArguments): Promise<boolean> {
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

        try {
            // TODO: Only check if result is true, make sure commandStore return booleans
            // TODO: Bot should be accessed protected (from this class)
            const actualResult = command.executed(context, resolvedArgs, context.bot.getAPI());
            const result: any = actualResult instanceof Promise ? await actualResult : actualResult;

            const commandCooldown: CommandCooldown = {
                context: context,
                command: command,

                // TODO: User should be able to specify more than just seconds (maybe cooldown
                // multiplier option?)
                end: Date.now() + (command.restrict.cooldown * 1000)
            };

            console.log(`Cooldown is ${command.restrict.cooldown * 1000} second(s)`);

            const lastCooldown = this.commandStore.getCooldown(command);

            // Delete the last cooldown before adding the new one for this command + user
            if (lastCooldown) {
                this.commandStore.cooldowns.splice(this.commandStore.cooldowns.indexOf(lastCooldown), 1);
            }

            this.commandStore.cooldowns.push(commandCooldown);
            context.bot.emit("commandExecuted", new CommandExecutedEvent(context, command), result);

            if (context.bot.options.autoDeleteCommands && context.message.deletable) {
                await context.message.delete();
            }
            else if (context.bot.options.checkCommands && context.message.channel instanceof TextChannel) {
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
            let specific: string | CommandRestrictGroup = command.restrict.specific[i];

            let valid: boolean = true;

            console.log("command ", command);
            console.log("specific", specific);

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
            else if (typeof specific === "number" && CommandRestrictGroup[specific] !== undefined) {
                switch (specific) {
                    case CommandRestrictGroup.ServerOwner: {
                        const owners: Array<Snowflake> = context.message.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_GUILD")).map((member: GuildMember) => member.id);

                        if (owners.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case CommandRestrictGroup.ServerModerator: {
                        const moderators: Array<Snowflake> = context.message.guild.members.array().filter((member: GuildMember) => member.hasPermission("MANAGE_ROLES")).map((member: GuildMember) => member.id);

                        if (moderators.includes(context.sender.id)) {
                            met = true;
                        }

                        break;
                    }

                    case CommandRestrictGroup.BotOwner: {
                        met = context.sender.id === context.bot.owner;

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
                Log.debug(CommandRestrictGroup, CommandRestrictGroup[specific]);
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
     * @param {ChatEnvironment|Array<ChatEnvironment>} environment
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
