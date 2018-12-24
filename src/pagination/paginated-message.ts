import {EventEmitter} from "events";
import {Message} from "discord.js";
import Bot from "../core/bot";
import Log from "../core/log";
import {IDisposable} from "../core/helpers";

export enum PaginationEvent {
    PageChanged = "pageChanged"
}

// TODO: Implement break lines code
/**
 * @extends EventEmitter
 */
export default class PaginatedMessage extends EventEmitter implements IDisposable {
    public readonly content: string;
    public readonly maxLength: number;
    public readonly breakLines: boolean;

    protected current: number;

    public constructor(content: string, maxLength: number = 2000, breakLines: boolean = true, currentPage: number = 0) {
        super();

        this.content = content;
        this.maxLength = maxLength;
        this.breakLines = breakLines;
        this.current = currentPage;
    }

    public next(pages: number = 1): this {
        if (this.current + pages >= 0 && this.current + pages <= this.maxPages) {
            this.current += pages;
            this.emit(PaginationEvent.PageChanged, this.current);
        }

        return this;
    }

    /**
     * @return {number}
     */
    public get maxPages(): number {
        if (this.content.length > this.maxLength) {
            return 1;
        }

        return this.content.length / this.maxLength;
    }

    /**
     * @param {Bot} bot
     * @param {Message} message
     * @param {string} [placeholder="*"]
     * @return {this}
     */
    public attach(bot: Bot, message: Message, placeholder: string = "*"): this {
        if (message.author.id !== bot.client.user.id) {
            Log.warn("[Pagination.attach] Refusing to attach to foreign message");

            return this;
        }

        this.on(PaginationEvent.PageChanged, async () => {
            if (!message.editable) {
                Log.warn("[Pagination.attach] Message is un-editable");

                return;
            }

            await message.edit(placeholder === "*" ? this.getPage() : message.content.replace(placeholder, this.getPage));
        });

        return this;
    }

    /**
     * @return {this}
     */
    public dispose(): this {
        Log.warn("[Pagination.dispose] Not yet implemented");

        return this;
    }

    /**
     * @param {number} [pages=1]
     * @return {this}
     */
    public previous(pages: number = 1): this {
        return this.next(pages * -1);
    }

    /**
     * @return {number}
     */
    public get currentPage(): number {
        return this.current + 1;
    }

    /**
     * @return {string}
     */
    public getPage(): string {
        return this.content.substring(this.current * this.maxLength, (this.current * this.maxLength) + this.maxLength);
    }
}
