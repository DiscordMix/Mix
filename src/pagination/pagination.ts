import {EventEmitter} from "events";
import {Message} from "discord.js";
import Bot from "../core/bot";
import Log from "../core/log";

export default class Pagination extends EventEmitter {
    public readonly content: string;
    public readonly maxLength: number;

    private current: number;

    public constructor(content: string, maxLength: number = 2048, currentPage: number = 0) {
        super();

        this.content = content;
        this.maxLength = maxLength;
        this.current = currentPage;
    }

    public next(pages: number = 1): this {
        if (this.current + pages > 0) {
            this.current += pages;
            this.emit("pageChanged", this.current);
        }

        return this;
    }

    public attach(bot: Bot, message: Message, placeholder: string = "*"): this {
        if (message.author.id !== bot.client.user.id) {
            Log.warn("[Pagination.attach] Refusing to attach to foreign message");

            return this;
        }

        this.on("pageChanged", async () => {
            if (!message.editable) {
                Log.warn("[Pagination.attach] Message is un-editable");

                return;
            }

            await message.edit(placeholder === "*" ? this.getPage() : message.content.replace(placeholder, this.getPage));
        });

        return this;
    }

    public dettach(): this {
        Log.warn("[Pagination.dettach] Not yet implemented");

        return this;
    }

    public previous(pages: number = 1): this {
        return this.next(pages * -1);
    }

    public get currentPage(): number {
        return this.current;
    }

    public getPage(): string {
        return this.content.substring(this.current * this.maxLength, (this.current * this.maxLength) + this.maxLength);
    }
}
