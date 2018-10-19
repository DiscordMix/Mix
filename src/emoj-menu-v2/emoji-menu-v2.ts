import {Message, MessageReaction, Snowflake, User} from "discord.js";
import Bot from "../core/bot";
import CommandContext from "../commands/command-context";
import {EventEmitter} from "events";

export type EmojiButtonClickHandler = (reaction: MessageReaction, user: User) => void;

export type EmojiButtonV2 = {
    readonly emoji: Snowflake;
    readonly public?: boolean;
    readonly added?: EmojiButtonClickHandler;
    readonly removed?: EmojiButtonClickHandler;
    readonly clicked?: EmojiButtonClickHandler;
}

export default class EmojiMenuV2 extends EventEmitter {
    public readonly messageId: Snowflake;
    public readonly ownerId: Snowflake;

    // TODO: Should be more productive if using Map
    public readonly buttons: EmojiButtonV2[];

    private bot?: Bot;

    public constructor(messageId: Snowflake, ownerId: Snowflake, buttons: EmojiButtonV2[] = []) {
        super();

        this.messageId = messageId;
        this.ownerId = ownerId;
        this.buttons = buttons;
        this.buttons = buttons;

        // Global click
        this.on("emojiClick", (reaction: MessageReaction, user: User, emoji: EmojiButtonV2) => {
            if (emoji.clicked !== undefined && typeof emoji.clicked === "function") {
                emoji.clicked(reaction, user);
            }
        });
    }

    public add(button: EmojiButtonV2): this {
        this.buttons.push(button);

        return this;
    }

    private handleMessageReactionAdd(reaction: MessageReaction, user: User): void {
        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === reaction.emoji.id) {
                if (!this.buttons[i].public && user.id !== this.ownerId) {
                    continue;
                }

                if (this.buttons[i].added !== undefined && typeof this.buttons[i].added === "function") {
                    (this.buttons[i].added as EmojiButtonClickHandler)(reaction, user);
                }

                this.emit("emojiClick", reaction, user, this.buttons[i]);
            }
        }
    }

    private handleMessageReactionRemove(reaction: MessageReaction, user: User): void {
        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === reaction.emoji.id) {
                if (!this.buttons[i].public && user.id !== this.ownerId) {
                    continue;
                }

                if (this.buttons[i].removed !== undefined && typeof this.buttons[i].removed === "function") {
                    (this.buttons[i].removed as EmojiButtonClickHandler)(reaction, user);
                }

                this.emit("emojiClick", reaction, user, this.buttons[i]);
            }
        }
    }

    public attach(context: Bot | CommandContext): this {
        this.bot = context instanceof Bot ? context : context.bot;
        this.bot.client.on("messageReactionAdd", this.handleMessageReactionAdd.bind(this));
        this.bot.client.on("messageReactionRemove", this.handleMessageReactionRemove.bind(this));

        return this;
    }

    public detach(): this {
        if (this.bot !== undefined) {
            this.bot.client.removeListener("messageReactionAdd", this.handleMessageReactionAdd);
        }

        return this;
    }
}
