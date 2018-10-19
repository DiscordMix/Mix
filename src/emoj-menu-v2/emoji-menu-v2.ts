import {MessageReaction, Snowflake, User} from "discord.js";
import Bot from "../core/bot";

export type EmojiButtonV2 = {
    readonly emoji: Snowflake;
    readonly public?: boolean;
    readonly clicked: (user: User) => void;
}

export default class EmojiMenuV2 {
    public readonly messageId: Snowflake;
    public readonly ownerId: Snowflake;
    public readonly buttons: EmojiButtonV2[];

    private bot?: Bot;

    public constructor(messageId: Snowflake, ownerId: Snowflake, buttons: EmojiButtonV2[]) {
        this.messageId = messageId;
        this.ownerId = ownerId;
        this.buttons = buttons;
    }

    private handleMessageReactionAdd(messageReaction: MessageReaction, user: User): void {
        for (let i: number = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].emoji === messageReaction.emoji.id) {
                if (!this.buttons[i].public && user.id !== this.ownerId) {
                    continue;
                }

                this.buttons[i].clicked(user);
            }
        }
    }

    public attach(bot: Bot): this {
        this.bot = bot;
        this.bot.client.on("messageReactionAdd", this.handleMessageReactionAdd.bind(this));

        return this;
    }

    public detach(): this {
        if (this.bot !== undefined) {
            this.bot.client.removeListener("messageReactionAdd", this.handleMessageReactionAdd);
        }

        return this;
    }
}
