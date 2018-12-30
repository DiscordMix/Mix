import {Message, MessageReaction, Snowflake, User} from "discord.js";
import Bot from "../core/bot";
import Context from "../commands/command-context";
import {EventEmitter} from "events";
import {IDisposable} from "../core/helpers";
import {DiscordEvent} from "../decorators/decorators";
import {PromiseOr} from "..";

export type EmojiClickHandler = (reaction: MessageReaction, user: User) => void;

export interface IEmojiButton {
    readonly emoji: Snowflake;
    readonly public?: boolean;
    readonly added?: EmojiClickHandler;
    readonly removed?: EmojiClickHandler;
    readonly clicked?: EmojiClickHandler;
    readonly add?: boolean;
}

export interface IEmojiMenu extends EventEmitter {
    add(button: IEmojiButton): this;
    attach(context: Context): PromiseOr<this>;

    readonly messageId: Snowflake;
    readonly ownerId: Snowflake;
    readonly buttons: IEmojiButton[];
}

/**
 * @extends EventEmitter
 * @implements {IDisposable}
 */
export default class EmojiMenu extends EventEmitter implements IEmojiMenu, IDisposable {
    public readonly messageId: Snowflake;
    public readonly ownerId: Snowflake;

    // TODO: Should be more productive if using Map
    public readonly buttons: IEmojiButton[];

    protected bot?: Bot;
    protected messageAttached?: Message;

    /**
     * @param {Snowflake} messageId
     * @param {Snowflake} ownerId
     * @param {IEmojiButton[]} [buttons=[]]
     */
    public constructor(messageId: Snowflake, ownerId: Snowflake, buttons: IEmojiButton[] = []) {
        super();

        /**
         * @type {Snowflake}
         * @readonly
         */
        this.messageId = messageId;
        
        /**
         * @type {Snowflake}
         * @readonly
         */
        this.ownerId = ownerId;

        /**
         * @type {IEmojiButton[]}
         * @readonly
         */
        this.buttons = buttons;

        // Global click
        this.on("emojiClick", (reaction: MessageReaction, user: User, emoji: IEmojiButton) => {
            if (emoji.clicked !== undefined && typeof emoji.clicked === "function") {
                emoji.clicked(reaction, user);
            }
        });
    }

    /**
     * @param {IEmojiButton} button
     * @return {this}
     */
    public add(button: IEmojiButton): this {
        this.buttons.push(button);

        return this;
    }

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    protected async handleMessageReactionAdd(reaction: MessageReaction, user: User): Promise<void> {
        if (reaction.message.id !== this.messageId || (this.bot && this.bot.client.user.id === user.id)) {
            return;
        }

        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === reaction.emoji.id || this.buttons[i].emoji === reaction.emoji.name) {
                if (!this.buttons[i].public && user.id !== this.ownerId) {
                    continue;
                }

                if (this.buttons[i].added !== undefined && typeof this.buttons[i].added === "function") {
                    await (this.buttons[i].added as EmojiClickHandler)(reaction, user);
                }

                this.emit("emojiClick", reaction, user, this.buttons[i]);
            }
        }
    }

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    protected async handleMessageReactionRemove(reaction: MessageReaction, user: User): Promise<void> {
        if (reaction.message.id !== this.messageId) {
            return;
        }

        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === reaction.emoji.id || this.buttons[i].emoji === reaction.emoji.name) {
                if (!this.buttons[i].public && user.id !== this.ownerId  || (this.bot && this.bot.client.user.id === user.id)) {
                    continue;
                }

                if (this.buttons[i].removed !== undefined && typeof this.buttons[i].removed === "function") {
                    await (this.buttons[i].removed as EmojiClickHandler)(reaction, user);
                }

                this.emit("emojiClick", reaction, user, this.buttons[i]);
            }
        }
    }

    /**
     * @param {Context} context
     * @return {Promise<this>}
     */
    public async attach(context: Context): Promise<this> {
        this.bot = context.bot;
        this.bot.client.on(DiscordEvent.MessageReactionAdded, this.handleMessageReactionAdd.bind(this));
        this.bot.client.on(DiscordEvent.MessageReactionRemoved, this.handleMessageReactionRemove.bind(this));
        this.bot.disposables.push(this);
        this.messageAttached = context.msg;
        await this.react();

        return this;
    }

    protected async react(): Promise<void> {
        if (!this.messageAttached) {
            return;
        }

        const message: Message = await this.messageAttached.channel.fetchMessage(this.messageId) as Message;

        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].add === false) {
                continue
            }

            await message.react(this.buttons[i].emoji);
        }
    }

    /**
     * @return {this}
     */
    public dispose(): this {
        if (this.bot !== undefined) {
            this.bot.client.removeListener(DiscordEvent.MessageReactionAdded, this.handleMessageReactionAdd);
            this.bot.client.removeListener(DiscordEvent.MessageReactionRemoved, this.handleMessageReactionRemove);
        }

        return this;
    }
}
