export default class MessageBuilder {
    /**
     * @param {string} [startingString=""]
     */
    constructor(startingString = "") {
        this.message = startingString;
    }

    /**
     * @param {string} string
     * @returns {MessageBuilder}
     */
    add(string) {
        this.message += string;

        return this;
    }

    /**
     * @param {(String|Null)} language
     * @param {(String|Null)} [code=null]
     * @returns {MessageBuilder}
     */
    codeBlock(language = null, code = null) {
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
     * @param {(string|null)} code
     * @returns {MessageBuilder}
     */
    code(code = null) {
        if (code === null) {
            return this.add("`");
        }

        return this.add(`\`${code}\``);
    }

    /**
     * @param {string} text
     * @returns {MessageBuilder}
     */
    italic(text) {
        return this.add(`*${text}*`);
    }

    /**
     * @param {string} text
     * @returns {MessageBuilder}
     */
    bold(text) {
        return this.add(`**${text}**`);
    }

    /**
     * @param {string} text
     * @returns {MessageBuilder}
     */
    underlined(text) {
        return this.add(`__${text}__`);
    }

    /**
     * @returns {MessageBuilder}
     */
    line() {
        return this.add("\n");
    }

    /**
     * @param {string} emoji
     * @returns {MessageBuilder}
     */
    emoji(emoji) {
        return this.add(`:${emoji}:`);
    }

    /**
     * @returns {string}
     */
    build() {
        return this.message;
    }
}
