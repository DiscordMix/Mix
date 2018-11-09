export default class FormattedMessage {
    private message: string;

    /**
     * @param {string} [startingString=""]
     */
    public constructor(startingString = "") {
        /**
         * @type {string}
         * @private
         */
        this.message = startingString;
    }

    /**
     * @param {string} text
     * @return {FormattedMessage}
     */
    public add(text: string): FormattedMessage {
        this.message += text;

        return this;
    }

    /**
     * @param {string} text
     * @return {FormattedMessage}
     */
    public addLine(text: string): FormattedMessage {
        this.add(text);
        this.line();

        return this;
    }

    /**
     * @param {string | null} [language=null]
     * @param {string | null} [code=null]
     * @return {FormattedMessage}
     */
    public codeBlock(code: string | null = null, language: string | null = null): FormattedMessage {
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
     * @return {FormattedMessage}
     */
    public code(code: string): FormattedMessage {
        return this.add(`\`${code}\``);
    }

    /**
     * @param {string} text
     * @return {FormattedMessage}
     */
    public italic(text: string): FormattedMessage {
        return this.add(`*${text}*`);
    }

    /**
     * @param {string} text
     * @return {FormattedMessage}
     */
    public bold(text: string): FormattedMessage {
        return this.add(`**${text}**`);
    }

    /**
     * @param {string} text
     * @return {FormattedMessage}
     */
    public underline(text: string): FormattedMessage {
        return this.add(`__${text}__`);
    }

    /**
     * @param {string} text
     * @return {FormattedMessage}
     */
    public strike(text: string): FormattedMessage {
        return this.add(`~~${text}~~`);
    }

    /**
     * @param {number} amount
     * @return {FormattedMessage}
     */
    public line(amount: number = 1): FormattedMessage {
        let counter = 0;

        while (counter !== amount) {
            this.add("\n");
            counter++;
        }

        return this;
    }

    /**
     * @param {string} emoji
     * @return {FormattedMessage}
     */
    public emoji(emoji: string): FormattedMessage {
        return this.add(`:${emoji}:`);
    }

    /**
     * @return {string}
     */
    public build(): string {
        return this.message;
    }
}
