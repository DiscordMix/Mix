import Log from "./log";
import Utils from "./utils";

const fs = require("fs");
const Typer = require("@raxor1234/typer/typer");

export default class Settings {
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
        }
        else {
            Log.throw("Could not load settings: File does not exist");
        }
    }

    /**
     * Reload settings
     * @returns {Promise<Settings>}
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
     * Save the local settings into path
     */
    save() {
        fs.writeFileSync(this.path, JSON.stringify({
            general: this.general,
            keys: this.keys
        }, null, 4));
    }

    // TODO
    validate() {
        if (!Typer.validate({
            token: "!string",
            prefix: "!string"
        }, this.general)) {
            Log.throw("[Settings.validate] Invalid settings provided");
        }
    }
}
