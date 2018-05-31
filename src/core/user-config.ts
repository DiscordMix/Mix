import Log from "./log";
import {Snowflake} from "discord.js";

const fs = require("fs");
const _ = require("lodash");

export default class UserConfig {
    private readonly path: string;

    private config: any;

    /**
     * @param {string} path
     */
    constructor(path: string) {
        /**
         * @type {string}
         * @private
         * @readonly
         */
        this.path = path;

        if (fs.existsSync(this.path)) {
            /**
             * @type {*}
             * @private
             */
            this.config = JSON.parse(fs.readFileSync(path).toString());
        }
        else {
            Log.error("Could not load user config: File does not exist");
        }
    }

    /**
     * @param {string} path
     * @param {*} value
     * @param {Snowflake|Null} guildId
     * @param {string} template
     */
    set(path: string, value: any, guildId = null, template: string = "default"): void {
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
     * @param {string} path
     * @param {(Snowflake|Null)} guildId
     * @param {string} template
     * @return {*}
     */
    get(path: string, guildId = null, template: string = "default"): any {
        const finalPath = guildId ? `${guildId}.${path}` : path;

        if (!this.contains(path, guildId)) {
            return _.get(this.config, `${template}.${path}`);
        }

        return _.get(this.config, finalPath);
    }

    /**
     * @param {string} path
     * @param {*} item
     * @param {(Snowflake|Null)} guildId
     */
    push(path: string, item: any, guildId = null): void {
        const items = this.get(path, guildId).slice(0);

        items.push(item);
        this.set(path, items, guildId);
    }

    /**
     * @param {string} path
     * @param {(Snowflake|Null)} guildId
     * @return {boolean}
     */
    contains(path: string, guildId = null): boolean {
        const finalPath = guildId ? `${guildId}.${path}` : path;

        return _.has(this.config, finalPath);
    }

    /**
     * @param {Snowflake} id
     */
    createGuild(id: Snowflake): void {
        this.set(id, {});
        this.save();
    }

    /**
     * @param {Snowflake} id
     */
    removeGuild(id: Snowflake): void {
        delete this.config[id];
        this.save();
    }

    save(): void {
        fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4));
    }
}
