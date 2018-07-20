import Command from "./command";
import Log from "../core/log";
import CommandStore from "./command-store";
import fs from "fs";
import path from "path";

export default class CommandLoader {
    private readonly commandStore: CommandStore;

    /**
     * @param {CommandStore} commandStore
     */
    constructor(commandStore: CommandStore) {
        /**
         * @type {CommandStore}
         * @private
         * @readonly
         */
        this.commandStore = commandStore;
    }

    /**
     * Load all the commandStore from the command manager's commandStore path
     * @return {Promise<number>}
     */
    reloadAll(): Promise<number> {
        this.commandStore.unloadAll();

        return this.loadAll(this.commandStore.path);
    }

    /**
     * @param {string} file The path to the command file
     * @param {string} moduleName
     * @return {boolean} Whether the command was validated and loaded successfully
     */
    load(file: string, moduleName: string): boolean {
        if (!file.startsWith("@") && file.endsWith(".js")) {
            const modulePath = path.join(this.commandStore.path, moduleName);

            let module = require(modulePath);

            if (Object.keys(module).length === 0) {
                Log.warn(`[CommandLoader.load] Command module is undefined for file '${file}' (Did you forget to export?)`);

                return false;
            }

            // Support for ES6-compiled modules
            if (module.default && typeof module.default === "object") {
                module = module.default;
            }

            // Validate the command before registering it
            if (Command.validate(module)) {
                this.commandStore.register(new Command(module));

                return true;
            }
            else {
                Log.warn(`[CommandLoader.load] Skipping invalid command: ${moduleName}`);
            }
        }
        else if (!file.endsWith(".d.ts")) {
            Log.verbose(`[CommandLoader.load] Skipping file: ${moduleName} (excluded or invalid name)`);
        }

        return false;
    }

    /**
     * Extract and load all commandStore from a directory
     * @param {string} directoryPath
     * @return {Promise<number>} The amount of successfully loaded commandStore
     */
    loadAll(directoryPath: string): Promise<number> {
        // TODO: Implement
        // Note: relative path | Remove a module from cache
        // delete require.cache[require.resolve(`./${commandName}.js`)];

        return new Promise((resolve) => {
            Log.verbose(`[CommandLoader.loadAll] Loading multiple commands`);

            fs.readdir(directoryPath, (error: Error, files: Array<string>) => {
                if (error) {
                    throw error;
                }

                let loaded: number = 0;

                for (let i: number = 0; i < files.length; i++) {
                    const moduleName: string = path.basename(files[i], ".js");

                    if (this.load(files[i], moduleName)) {
                        loaded++;
                    }
                }

                Log.success(`[CommandLoader.loadAll] Loaded a total of ${loaded} command(s)`);
                resolve(loaded);
            });
        });
    }

    /**
     * @param {string} name
     * @return {Promise<boolean>}
     */
    async loadPrimitive(name: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const modulePath = path.join(__dirname, "primitives", `${name}.js`);

            if (!fs.existsSync(modulePath)) {
                Log.error(`[CommandLoader.loadPrimitive] Primitive command does not exist: ${modulePath}`);

                resolve(false);
            }

            let module = require(modulePath);

            // Support for ES6-compiled modules
            if (module.default && typeof module.default === "object") {
                module = module.default;
            }

            // Validate the command before registering it
            if (Command.validate(module)) {
                this.commandStore.register(new Command(module));

                resolve(true);
            }
            else {
                Log.warn(`[CommandLoader.loadPrimitive] Primitive was found, but was validated invalid: ${name}`);
                resolve(false);
            }
        });
    }

    /**
     * @param {Array<string>} names
     * @return {Promise<number>}
     */
    async loadPrimitives(names: Array<string>): Promise<number> {
        Log.verbose(`[CommandLoader.loadPrimitives] Attempting to load ${names.length} primitive commands`);

        let loaded = 0;

        for (let i = 0; i < names.length; i++) {
            if (await this.loadPrimitive(names[i])) {
                loaded++;
            }
        }

        Log.success(`[CommandLoader.loadPrimitives] Successfully loaded ${loaded}/${names.length} primitive commands`);

        return loaded;
    }
}
