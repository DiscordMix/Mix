import Log from "../core/log";
import Utils from "../core/utils";

const readline = require("readline");

export default class ConsoleInterface {
    constructor() {
        /**
         * Whether the console interface has been successfully setup
         * @type {Boolean}
         */
        this.ready = false;
    }

    /**
     * @param {Bot} bot
     */
    setup(bot) {
        Log.verbose("[ConsoleInterface] Setting up console interface");

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

                case "restart": {
                    bot.restart();

                    break;
                }

                case "ping": {
                    console.log(`${bot.client.ping}ms`);

                    break;
                }

                case "uptime": {
                    console.log(`Started ${Utils.timeAgoFromNow(bot.client.uptime)}`);

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
        this.ready = true;
        Log.success("[ConsoleInterface.setup] Console interface setup completed");
    }
}
