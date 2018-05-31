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
     * @todo Return type
     * Load all the commands from path
     * @returns {Promise}
     */
    async reloadAll(): Promise<any> {
        // TODO: Implement
        // Note: relative path | Remove a module from cache
        // delete require.cache[require.resolve(`./${commandName}.js`)];

        return new Promise((resolve) => {
            Log.verbose(`[CommandLoader.loadAll] Loading commands`);

            this.manager.unloadAll();

            fs.readdir(this.manager.path, (error: any, files: Array<string>) => {
                let loaded = 0;

                files.forEach((file: string) => {
                    const moduleName = path.basename(file, ".js");

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
                            loaded++;
                        }
                        else {
                            Log.warn(`[CommandLoader.loadAll] Skipping invalid command: ${moduleName}`);
                        }
                    }
                    else {
                        Log.verbose(`[CommandLoader.loadAll] Skipping command: ${moduleName}`);
                    }
                });

                Log.success(`[CommandLoader.loadAll] Loaded a total of ${loaded} command(s)`);
                resolve();
            });
        });
    }

    load(path: string) {
        // TODO
    }
}
