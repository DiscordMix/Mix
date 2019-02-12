import {Message, TextChannel, RichEmbed} from "discord.js";
import Util from "./util";
import {BotEvent} from "./bot-extra";
import Log from "./log";
import BotMessages from "./messages";
import CommandParser from "../commands/command-parser";
import Command, {RawArguments} from "../commands/command";
import Context from "../commands/context";
import {PromiseOr} from "@atlas/xlib";
import Bot from "./bot";

export interface IBotHandler {
    message(msg: Message, edited: boolean): PromiseOr<boolean>;
    command(message: Message, content: string, resolvers: any): PromiseOr<void>;
    createContext(msg: Message): Context;
}

export default class BotHandler implements IBotHandler {
    protected readonly bot: Bot;

    public constructor(bot: Bot) {
        this.bot = bot;

        // Bind message handler because it is directly bound on the 'message' event, thus losing context.
        this.message = this.message.bind(this);
    }

    /**
     * Handle an incoming message.
     * @param {Message} msg The incoming message.
     * @param {boolean} [edited=false] Whether the message was previously edited.
     */
    public async message(msg: Message, edited: boolean = false): Promise<boolean> {
        if (Util.isEmpty(msg) || typeof msg !== "object" || !(msg instanceof Message) || Array.isArray(msg)) {
            return false;
        }

        this.bot.analytics.stats.messagesSeen++;

        if (this.bot.suspended) {
            return false;
        }

        this.bot.emit(BotEvent.HandleMessageStart);

        if (this.bot.options.logMessages) {
            const names: any = {};

            if (msg.channel.type === "text" && msg.guild !== undefined) {
                names.guild = msg.guild.name;
                names.channel = ` # ${(msg.channel as TextChannel).name}`;
            }
            else if (msg.channel.type === "dm" && msg.guild === undefined) {
                names.guild = "";
                names.channel = "Direct Messages";
            }
            else {
                names.guild = "Unknown";
                names.channel = " # Unknown";
            }

            Log.info(`[${msg.author.tag} @ ${names.guild}${names.channel}] ${Util.cleanMessage(msg)}${edited ? " [Edited]" : ""}`);
        }

        // TODO: Cannot do .startsWith with a prefix array.
        if ((!msg.author.bot || (msg.author.bot && !this.bot.options.ignoreBots)) /*&& message.content.startsWith(this.settings.general.prefix)*/ && CommandParser.validate(msg.content, this.bot.registry, this.bot.options.prefixes)) {
            if (this.bot.options.allowCommandChain) {
                // TODO: Might split values too.
                const rawChain: string[] = msg.content.split("~");

                // TODO: Should be bot option.
                const maxChainLength: number = 5;

                let allowed: boolean = true;

                if (rawChain.length > maxChainLength) {
                    allowed = false;
                    msg.reply(`Maximum allowed chain length is ${maxChainLength} commands. Your commands were not executed.`);
                }

                if (allowed) {
                    const chain: string[] = rawChain.slice(0, maxChainLength);

                    // TODO: What if commandChecks is start and the bot tries to react twice or more?
                    for (const chainItem of chain) {
                        await this.command(msg, chainItem.trim(), this.bot.argumentResolvers);
                    }
                }
            }
            else {
                await this.command(msg, msg.content, this.bot.argumentResolvers);
            }
        }
        // TODO: ?prefix should also be chain-able.
        else if (!msg.author.bot && msg.content === "?prefix" && this.bot.usePrefixCommand) {
            await msg.channel.send(new RichEmbed()
                .setDescription(`Command prefix(es): **${this.bot.options.prefixes.join(", ")}** | Powered by [The Mix Framework](https://github.com/discord-mix/mix)`)
                .setColor("GREEN"));
        }
        // TODO: There should be an option to disable this.
        // TODO: Use embeds.
        // TODO: Verify that it was done in the same environment and that the user still has perms.
        else if (!msg.author.bot && msg.content === "?undo") {
            if (!this.bot.commandHandler.undoMemory.has(msg.author.id)) {
                await msg.reply(BotMessages.UNDO_NO_ACTIONS);
            }
            else if (this.bot.commandHandler.undoAction(msg.author.id, msg)) {
                await msg.reply(BotMessages.UNDO_OK);
                this.bot.commandHandler.undoMemory.delete(msg.author.id);
            }
            else {
                await msg.reply(BotMessages.UNDO_FAIL);
            }
        }

        this.bot.emit(BotEvent.HandleMessageEnd);

        return true;
    }

    // TODO: Investigate the resolvers parameter usage (is it even used or required?).
    public async command(message: Message, content: string, resolvers: any): Promise<void> {
        this.bot.emit(BotEvent.HandleCommandMessageStart, message, content);

        const command: Command | null = await CommandParser.parse(
            content,
            this.bot.registry,
            this.bot.options.prefixes
        );

        if (command === null) {
            throw Log.error(BotMessages.CMD_PARSE_FAIL);
        }

        const rawArgs: RawArguments = CommandParser.resolveDefaultArgs({
            arguments: CommandParser.getArguments(content, command.args),
            command,
            schema: command.args,

            // TODO: Should pass context instead of just message for more flexibility from defaultValue fun.
            message
        });

        // TODO: Debugging.
        Log.debug("Raw arguments are", rawArgs);

        await this.bot.commandHandler.handle(
            this.createContext(message),
            command,
            rawArgs
        );

        this.bot.emit(BotEvent.HandleCommandMessageEnd, message, content);
    }

    /**
     * Create a linked command context instance.
     */
    public createContext(msg: Message): Context {
        return new Context({
            bot: this.bot,
            msg,
            // args: CommandParser.resolveArguments(CommandParser.getArguments(content), this.commandHandler.argumentTypes, resolvers, message),

            // TODO: CRITICAL: Possibly messing up private messages support, hotfixed to use null (no auth) in DMs (old comment: review).

            label: CommandParser.getCommandBase(msg.content, this.bot.options.prefixes)
        });
    }
}
