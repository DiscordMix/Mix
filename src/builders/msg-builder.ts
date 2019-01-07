import {IBuilder} from "./builder";
import {Log} from "..";

export interface IMsgBuilder<T> extends IBuilder<string> {
    append(text: string): this;
    add(text: string): this;
    block(language?: string): this;
    code(code: string): this;
    italic(text: string): this;
    bold(text: string): this;
    underline(text: string): this;
    strike(text: string): this;
    line(amount: number): this;
    emoji(emoji: string): this;
    format(callback: FormatterCallback<T>): this;
    feed(item: T): this;
}

export type FormatterCallback<T> = (item: T) => string;

export default class MsgBuilder<T = any> implements IMsgBuilder<T> {
    protected message: string;
    protected formatter?: FormatterCallback<T>;

    /**
     * @param {string} [value=""]
     */
    public constructor(value = "") {
        /**
         * @type {string}
         * @protected
         */
        this.message = value;
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public append(text: string): this {
        this.message += text;

        return this;
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public add(text: string): this {
        this.append(text);
        this.line();

        return this;
    }

    /**
     * @param {string | undefined} language
     * @return {MsgBuilder}
     */
    public block(language?: string): this {
        let result = "```";

        if (language !== undefined) {
            result += `${language}\n`;
        }

        return this.append(result);
    }

    /**
     * @param {string} code
     * @return {MsgBuilder}
     */
    public code(code: string): this {
        return this.append(`\`${code}\``);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public italic(text: string): this {
        return this.append(`*${text}*`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public bold(text: string): this {
        return this.append(`**${text}**`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public underline(text: string): this {
        return this.append(`__${text}__`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public strike(text: string): this {
        return this.append(`~~${text}~~`);
    }

    /**
     * @param {number} amount
     * @return {MsgBuilder}
     */
    public line(amount: number = 1): this {
        let counter = 0;

        while (counter !== amount) {
            this.append("\n");
            counter++;
        }

        return this;
    }

    /**
     * @param {string} emoji
     * @return {MsgBuilder}
     */
    public emoji(emoji: string): this {
        return this.append(`:${emoji}:`);
    }

    public format(callback: FormatterCallback<T>): this {
        this.formatter = callback;

        return this;
    }

    public feed(item: T): this {
        if (this.formatter === undefined || typeof this.formatter !== "function") {
            throw Log.error("Expecting formatter to be set and to be a function");
        }

        this.append(this.formatter(item));

        return this;
    }

    /**
     * @return {string}
     */
    public build(): string {
        return this.message;
    }
}
