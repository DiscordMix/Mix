import {IBuilder} from "./builder";

export interface IMsgBuilder extends IBuilder<string> {
    add(text: string): this;
    addLine(text: string): this;
    codeBlock(code: string | null, language: string | null): this;
    code(code: string): this;
    italic(text: string): this;
    bold(text: string): this;
    underline(text: string): this;
    strike(text: string): this;
    line(amount: number): this;
    emoji(emoji: string): this;
}

export default class MsgBuilder implements IMsgBuilder {
    protected message: string;

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
    public add(text: string): this {
        this.message += text;

        return this;
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public addLine(text: string): this {
        this.add(text);
        this.line();

        return this;
    }

    /**
     * @param {string | null} [language=null]
     * @param {string | null} [code=null]
     * @return {MsgBuilder}
     */
    public codeBlock(code: string | null = null, language: string | null = null): this {
        let result = "```";

        if (language !== null) {
            result += `${language}\n`;
        }

        if (code !== null) {
            result += `${code}\n\`\`\``;
        }

        return this.add(result);
    }

    /**
     * @param {string} code
     * @return {MsgBuilder}
     */
    public code(code: string): this {
        return this.add(`\`${code}\``);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public italic(text: string): this {
        return this.add(`*${text}*`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public bold(text: string): this {
        return this.add(`**${text}**`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public underline(text: string): this {
        return this.add(`__${text}__`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public strike(text: string): this {
        return this.add(`~~${text}~~`);
    }

    /**
     * @param {number} amount
     * @return {MsgBuilder}
     */
    public line(amount: number = 1): this {
        let counter = 0;

        while (counter !== amount) {
            this.add("\n");
            counter++;
        }

        return this;
    }

    /**
     * @param {string} emoji
     * @return {MsgBuilder}
     */
    public emoji(emoji: string): this {
        return this.add(`:${emoji}:`);
    }

    /**
     * @return {string}
     */
    public build(): string {
        return this.message;
    }
}
