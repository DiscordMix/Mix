import {IBuilder} from "./builder";

export default class MsgBuilder implements IBuilder<string> {
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
    public add(text: string): MsgBuilder {
        this.message += text;

        return this;
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public addLine(text: string): MsgBuilder {
        this.add(text);
        this.line();

        return this;
    }

    /**
     * @param {string | null} [language=null]
     * @param {string | null} [code=null]
     * @return {MsgBuilder}
     */
    public codeBlock(code: string | null = null, language: string | null = null): MsgBuilder {
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
    public code(code: string): MsgBuilder {
        return this.add(`\`${code}\``);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public italic(text: string): MsgBuilder {
        return this.add(`*${text}*`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public bold(text: string): MsgBuilder {
        return this.add(`**${text}**`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public underline(text: string): MsgBuilder {
        return this.add(`__${text}__`);
    }

    /**
     * @param {string} text
     * @return {MsgBuilder}
     */
    public strike(text: string): MsgBuilder {
        return this.add(`~~${text}~~`);
    }

    /**
     * @param {number} amount
     * @return {MsgBuilder}
     */
    public line(amount: number = 1): MsgBuilder {
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
    public emoji(emoji: string): MsgBuilder {
        return this.add(`:${emoji}:`);
    }

    /**
     * @return {string}
     */
    public build(): string {
        return this.message;
    }
}
