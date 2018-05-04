import Log from "../core/log";

const readline = require("readline");

export default class ConsoleInterface {
	/**
	 * @param {Bot} bot
	 */
	init(bot) {
		const ci = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		ci.prompt(true);

		ci.on("line", (input) => {
			switch (input.trim()) {
				case "": {
					break;
				}

				case "stop": {
					bot.disconnect();
					process.exit(0);

					break;
				}

				case "help": {
					console.log("CLI Commands: stop, help");

					break;
				}

				default: {
					console.log(`Invalid command: ${input}`);
				}
			}

			ci.prompt();
		});

		ci.on("close", () => {
			// TODO: Temp. disabled due to interferring and going straight disconnection on vps/linux
			/* bot.disconnect();
			process.exit(0); */
		});

		// TODO: Should log before setting the prompt
		Log.verbose("Console interface setup completed");
	}
}
