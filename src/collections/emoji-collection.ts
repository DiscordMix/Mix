import Collection from "./collection";

const fs = require("fs");

/**
 * @extends Collection
 */
export default class EmojiCollection extends Collection {
    /**
     * @param {Array<Object>} emojis
     */
    constructor(emojis: Array<any> = []) {
        super(emojis);
    }

    /**
     * @param {string} name
     * @return {string}
     */
    get(name: string): string {
        return this.find("name", name).id;
    }

    /**
     * @param {string} path
     * @return {EmojiCollection}
     */
    static fromFile(path: string): EmojiCollection {
        if (!fs.existsSync(path)) {
            throw new Error(`[EmojiCollection.fromFile] Path does not exist: ${path}`);
        }

        return new EmojiCollection(JSON.parse(fs.readFileSync(path).toString()));
    }
}
