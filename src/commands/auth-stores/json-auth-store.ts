import Utils from "../../core/utils";
import ObjectAuthStore from "./object-auth-store";
import Log from "../../core/log";

const fs = require("fs");

/**
 * @extends ObjectAuthStore
 */
export default class JsonAuthStore extends ObjectAuthStore {
    private readonly schemaPath: string;
    private readonly storePath: string;

    /**
     * @param {string} schemaPath
     * @param {string} storePath
     */
    constructor(schemaPath: string, storePath: string) {
        super(null, null);

        /**
         * The path of the schema file
         * @type {string}
         * @private
         * @readonly
         */
        this.schemaPath = schemaPath;

        /**
         * The path of the store file
         * @type {string}
         * @private
         * @readonly
         */
        this.storePath = storePath;

        // Automatically save the currently loaded data when a guild is created
        this.on("guildCreated", () => {
            this.save();
        });

        // Validate the store when created
        if (!this.validate()) {
            Log.error(`[JsonAuthStore] Store/schema path(s) do not exist`);
        }
    }

    /**
     * @return {boolean}
     */
    validate(): boolean {
        return fs.existsSync(this.schemaPath) && fs.existsSync(this.storePath);
    }

    /**
     * @todo Complete
     * @return {Promise<*>}
     */
    async reload(): Promise<any> {
        if (!this.exists) {
            this.data = {};
            await Utils.writeJson(this.storePath, this.data);
            Log.info("[JsonAuthStore.reload] Auth store path did not exist, created default");
        }
        else {
            this.data = await Utils.readJson(this.storePath);
        }

        if (!fs.existsSync(this.schemaPath)) {
            Log.throw(`[JsonAuthStore] Schema file does not exist in path: ${this.schemaPath}`);
        }

        this.schema = await Utils.readJson(this.schemaPath);
    }

    /**
     * Save the currently loaded data into the store file
     * @return {Promise<*>}
     */
    async save(): Promise<boolean> {
        return Utils.writeJson(this.storePath, this.data);
    }

    /**
     * Determine whether the store file exists
     * @return {boolean} Whether the store file exists
     */
    get exists(): boolean {
        return fs.existsSync(this.storePath) && fs.existsSync(this.schemaPath);
    }
}
