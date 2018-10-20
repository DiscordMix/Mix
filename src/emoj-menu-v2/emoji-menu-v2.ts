import {Message, MessageReaction, Snowflake, User} from "discord.js";
import Bot from "../core/bot";
import CommandContext from "../commands/command-context";
import {EventEmitter} from "events";
import {DiscordEvent, IDisposable} from "..";

export type IEmojiButtonClickHandler = (reaction: MessageReaction, user: User) => void;

export type IEmojiButtonV2 = {
    readonly emoji: Snowflake;
    readonly public?: boolean;
    readonly add?: boolean;
    readonly added?: IEmojiButtonClickHandler;
    readonly removed?: IEmojiButtonClickHandler;
    readonly clicked?: IEmojiButtonClickHandler;
}

export default class EmojiMenuV2 extends EventEmitter implements IDisposable {
    public readonly messageId: Snowflake;
    public readonly ownerId: Snowflake;

    // TODO: Should be more productive if using Map
    public readonly buttons: IEmojiButtonV2[];

    private bot?: Bot;
    private context?: CommandContext;

    public constructor(messageId: Snowflake, ownerId: Snowflake, buttons: IEmojiButtonV2[] = []) {
        super();

        this.messageId = messageId;
        this.ownerId = ownerId;
        this.buttons = buttons;

        // Global click
        this.on("emojiClick", (reaction: MessageReaction, user: User, emoji: IEmojiButtonV2) => {
            if (emoji.clicked !== undefined && typeof emoji.clicked === "function") {
                emoji.clicked(reaction, user);
            }
            
        });
    }

    public add(button: IEmojiButtonV2): this {
        this.buttons.push(button);

        return this;
    }

    private async handleMessageReactionAdd(reaction: MessageReaction, user: User): void {
        if (reaction.message.id !== this.messageId || (this.bot && this.bot.client.user.id === user.id)) {
            return;
        }

        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === reaction.emoji.id) {
                if (!this.buttons[i].public && user.id !== this.ownerId) {
                    continue;
                }

                if (this.buttons[i].added !== undefined && typeof this.buttons[i].added === "function") {
                    await (this.buttons[i].added as IEmojiButtonClickHandler)(reaction, user);
                }

                this.emit("emojiClick", reaction, user, this.buttons[i]);
            }
        }
    }

    private async handleMessageReactionRemove(reaction: MessageReaction, user: User): void {
        if (reaction.message.id !== this.messageId || (this.bot && this.bot.client.user.id === user.id)) {
            return;
        }

        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === reaction.emoji.id) {
                if (!this.buttons[i].public && user.id !== this.ownerId) {
                    continue;
                }

                if (this.buttons[i].removed !== undefined && typeof this.buttons[i].removed === "function") {
                    await (this.buttons[i].removed as IEmojiButtonClickHandler)(reaction, user);
                }

                this.emit("emojiClick", reaction, user, this.buttons[i]);
            }
        }
    }

    public async attach(context: CommandContext): Promise<this> {
        this.bot = context.bot;
        this.context = context;
        this.bot.client.on(DiscordEvent.MessageReactionAdded, this.handleMessageReactionAdd.bind(this));
        this.bot.client.on(DiscordEvent.MessageReactionRemoved, this.handleMessageReactionRemove.bind(this));
        this.bot.disposables.push(this);
        await this.react();

        return this;
    }

    private async react(): Promise<void> {
        if (!this.context) return;
        let message = await this.context.message.channel.fetchMessage(this.messageId);
        for (let button of this.buttons) {
            if (button.add === false) {
                continue
            }

            await message.react(button.emoji);
        }
    }
   
    public dispose(): this {
        if (this.bot !== undefined) {
            this.bot.client.removeListener(DiscordEvent.MessageReactionAdded, this.handleMessageReactionAdd);
            this.bot.client.removeListener(DiscordEvent.MessageReactionRemoved, this.handleMessageReactionRemove);
        }

        return this;
    }
}
