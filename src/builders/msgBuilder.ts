import Log from "../core/log";
import IBuilder from "./builder";

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

    public constructor(value = "") {
        this.message = value;
    }

    public append(text: string): this {
        this.message += text;

        return this;
    }

    public add(text: string): this {
        this.append(text);
        this.line();

        return this;
    }

    public block(language?: string): this {
        let result = "```";

        if (language !== undefined) {
            result += `${language}\n`;
        }

        return this.append(result);
    }

    public code(code: string): this {
        return this.append(`\`${code}\``);
    }

    public italic(text: string): this {
        return this.append(`*${text}*`);
    }

    public bold(text: string): this {
        return this.append(`**${text}**`);
    }

    public underline(text: string): this {
        return this.append(`__${text}__`);
    }

    public strike(text: string): this {
        return this.append(`~~${text}~~`);
    }

    public line(amount: number = 1): this {
        let counter = 0;

        while (counter !== amount) {
            this.append("\n");
            counter++;
        }

        return this;
    }

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

    public build(): string {
        return this.message;
    }
}
