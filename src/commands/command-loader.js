import Command from "./command";
import Log from "../core/log";

const fs = require("fs");
const path = require("path");

export default class CommandLoader {
	/**
	 * @param {CommandManager} commandManager
	 */
	constructor(commandManager) {
		/**
		 * @type {CommandManager}
		 * @private
		 */
		this.commandManager = commandManager;
	}

	/**
	 * Load all the commands from path
	 * @returns {Promise}
	 */
	async loadAll() {
		return new Promise((resolve) => {
			fs.readdir(this.commandManager.path, (error, files) => {
				let loaded = 0;

				files.forEach((file) => {
					if (!file.startsWith("@")) {
						const modulePath = path.join(this.commandManager.path, path.basename(file, ".js"));

						let module = require(modulePath);

						// Support for ES6-compiled modules
						if (module.default && typeof module.default === "object") {
							module = module.default;
						}

						// Validate the command before registering it
						if (Command.validate(module)) {
							this.commandManager.register(new Command(module));
							loaded++;
						}
						else {
							Log.warn(`[CommandLoader.loadAll] Skipping invalid command: ${path.basename(file, ".js")}`);
						}
					}
					else {
						Log.verbose(`[CommandLoader.loadAll] Skipping command: ${path.basename(file, ".js")}`);
					}
				});

				Log.success(`[CommandLoader.loadAll] Loaded a total of ${loaded} command(s)`);
				resolve();
			});
		});
	}

	load(pth) {
		// TODO
	}
}
