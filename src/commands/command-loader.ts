import Command from "./command";
import Log from "../core/log";
import CommandManager from "./command-manager";

const fs = require("fs");
const path = require("path");

export default class CommandLoader {
    private readonly manager: CommandManager;

    /**
     * @param {CommandManager} manager
     */
    constructor(manager: CommandManager) {
        /**
         * @type {CommandManager}
         * @private
         * @readonly
         */
        this.manager = manager;
    }

    /**
     * Load all the commands from the command manager's commands path
     * @return {Promise<number>}
     */
    reloadAll(): Promise<number> {
        this.manager.unloadAll();

        return this.loadAll(this.manager.path);
    }

    /**
     * @param {string} file The path to the command file
     * @param {string} moduleName
     * @returns {boolean} Whether the command was validated and loaded successfully
     */
    load(file: string, moduleName: string): boolean {
        if (!file.startsWith("@")) {
            const modulePath = path.join(this.manager.path, moduleName);

            let module = require(modulePath);

            // Support for ES6-compiled modules
            if (module.default && typeof module.default === "object") {
                module = module.default;
            }

            // Validate the command before registering it
            if (Command.validate(module)) {
                this.manager.register(new Command(module));

                return true;
            }
            else {
                Log.warn(`[CommandLoader.load] Skipping invalid command: ${moduleName}`);
            }
        }
        else {
            Log.verbose(`[CommandLoader.load] Skipping command: ${moduleName} (file name starts with @)`);
        }

        return false;
    }

    /**
     * Extract and load all commands from a directory
     * @param {string} directoryPath
     * @returns {Promise<number>} The amount of successfully loaded commands
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
}
