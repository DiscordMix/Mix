import Command from "./command";
import Log from "../core/log";

const fs = require("fs");
const path = require("path");
const Typer = require("@raxor1234/typer");

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

	loadAll() {
		Log.info("Loadall");

		fs.readdir(this.commandManager.commandsPath, (error, files) => {
			Log.verbose("Readdir");

			files.forEach((file) => {
				if (!file.startsWith("@")) {
					const modulePath = path.join(this.commandManager.commandsPath, path.basename(file, ".js"));

					let module = require(modulePath);

					// Support for ES6 compiled
					if (module.default && typeof module.default === "object") {
						module = module.default;
					}

					if (CommandLoader.validate(module)) {
						this.commandManager.register(Command.fromModule(module));
					}
					else {
						Log.warn(`Skipping invalid command: ${path.basename(file, ".js")}`);
					}
				}
				else {
					Log.verbose(`Skipping command: ${path.basename(file, ".js")}`);
				}
			});

			Log.verbose(`Loaded a total of ${files.length} commands`);
		});
	}

	load(pth) {
		// TODO
	}

	/**
	 * @param {Object} module
	 * @returns {Boolean}
	 */
	static validate(module) {
		Typer.validate({
			executed: "function",
			canExecute: "function",
			meta: "object"
		}, module);

		Typer.validate({
			name: "string",
			description: "string",
			accessLevel: "number",
			aliases: "object",
			maxArguments: "number"
		}, module.meta);

		// TODO
		return true;
	}
}
