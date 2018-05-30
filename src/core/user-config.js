import Log from "./log";

const fs = require("fs");
const _ = require("lodash");

export default class UserConfig {
    /**
     * @param {String} path
     */
    constructor(path) {
        if (fs.existsSync(path)) {
            /**
             * @type {String}
             * @private
             * @readonly
             */
            this.path = path;

            /**
             * @type {any}
             * @private
             */
            this.config = JSON.parse(fs.readFileSync(path).toString());
        }
        else {
            Log.error("Could not load user config: File does not exist");
        }
    }

    /**
     * @param {String} path
     * @param {*} value
     * @param {(Snowflake|Null)} guildId
     * @param {String} template
     */
    set(path, value, guildId = null, template = "default") {
        const finalPath = guildId ? `${guildId}.${path}` : path;

        Log.info(finalPath);

        if (this.get(`${template}.${path}`, guildId) === value) {
            _.unset(this.config, finalPath);
        }
        else {
            _.set(this.config, finalPath, value);
            Log.info(`set ${finalPath} to ${value}`);
        }

        this.save();
    }

    /**
     * @param {String} path
     * @param {(Snowflake|Null)} guildId
     * @param {String} template
     * @returns {*}
     */
    get(path, guildId = null, template = "default") {
        const finalPath = guildId ? `${guildId}.${path}` : path;

        if (!this.contains(path, guildId)) {
            return _.get(this.config, `${template}.${path}`);
        }

        return _.get(this.config, finalPath);
    }

    /**
     * @param {String} path
     * @param {*} item
     * @param {(Snowflake|Null)} guildId
     */
    push(path, item, guildId = null) {
        const items = this.get(path, guildId).slice(0);

        items.push(item);
        this.set(path, items, guildId);
    }

    /**
     * @param {String} path
     * @param {(Snowflake|Null)} guildId
     * @returns {boolean}
     */
    contains(path, guildId = null) {
        const finalPath = guildId ? `${guildId}.${path}` : path;

        return _.has(this.config, finalPath);
    }

    /**
     * @param {Snowflake} id
     */
    createGuild(id) {
        this.set(id, {});
        this.save();
    }

    /**
     * @param {Snowflake} id
     */
    removeGuild(id) {
        delete this.config[id];
        this.save();
    }

    save() {
        fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
    }
}
