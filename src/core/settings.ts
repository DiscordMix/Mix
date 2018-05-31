import Log from "./log";
import Utils from "./utils";

const fs = require("fs");
const Typer = require("@raxor1234/typer/typer");

export default class Settings {
    private readonly path: string;

    general: any;
    keys: any;

    /**
     * @param {String} path
     */
    constructor(path: string) {
        /**
         * @type {String}
         * @private
         * @readonly
         */
        this.path = path;

        if (!fs.existsSync(this.path)) {
            Log.throw("Could not load settings: File does not exist");
        }
    }

    /**
     * Reload settings
     * @return {Promise<Settings>}
     */
    async reload() {
        const jsonObj = await Utils.readJson(this.path);

        // TODO: Should be automatic
        // TODO: Should be validated using Schema | probably old comment
        /**
         * @type {Object}
         * @readonly
         */
        this.general = jsonObj.general;

        /**
         * @type {Object}
         * @readonly
         */
        this.keys = jsonObj.keys;

        // Validate settings after loading them
        this.validate();

        return this;
    }

    /**
     * @todo Should be done async
     * Save the local settings into path
     * @return {Settings}
     */
    save() {
        fs.writeFileSync(this.path, JSON.stringify({
            general: this.general,
            keys: this.keys
        }, null, 4));

        return this;
    }

    /**
     * Validate the settings
     * @todo
     * @return {Settings}
     */
    validate() {
        if (!Typer.validate({
            token: "!string",
            prefix: "!string"
        }, this.general)) {
            Log.throw("[Settings.validate] Invalid settings provided");
        }

        return this;
    }
}
