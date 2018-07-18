export default class MessageBuilder {
    private message: string;

    /**
     * @param {string} [startingString=""]
     */
    constructor(startingString = "") {
        /**
         * @type {string}
         * @private
         */
        this.message = startingString;
    }

    /**
     * @param {string} text
     * @return {MessageBuilder}
     */
    add(text: string): MessageBuilder {
        this.message += text;

        return this;
    }

    /**
     * @param {string|null} [language=null]
     * @param {string|null} [code=null]
     * @return {MessageBuilder}
     */
    codeBlock(language = null, code = null): MessageBuilder {
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
     * @return {MessageBuilder}
     */
    code(code: string): MessageBuilder {
        return this.add(`\`${code}\``);
    }

    /**
     * @param {string} text
     * @return {MessageBuilder}
     */
    italic(text: string): MessageBuilder {
        return this.add(`*${text}*`);
    }

    /**
     * @param {string} text
     * @return {MessageBuilder}
     */
    bold(text: string): MessageBuilder {
        return this.add(`**${text}**`);
    }

    /**
     * @param {string} text
     * @return {MessageBuilder}
     */
    underlined(text: string): MessageBuilder {
        return this.add(`__${text}__`);
    }

    /**
     * @param {number} amount
     * @return {MessageBuilder}
     */
    line(amount: number = 1): MessageBuilder {
        let counter = 0;

        while (counter !== amount) {
            this.add("\n");
            counter++;
        }

        return this;
    }

    /**
     * @param {string} emoji
     * @return {MessageBuilder}
     */
    emoji(emoji: string): MessageBuilder {
        return this.add(`:${emoji}:`);
    }

    /**
     * @return {string}
     */
    build(): string {
        return this.message;
    }
}
