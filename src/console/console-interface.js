import Log from "../core/log";
import Utils from "../core/utils";

const readline = require("readline");
const { performance } = require("perf_hooks");

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

        ci.on("line", async (input) => {
            switch (input.trim()) {
                case "": {
                    break;
                }

                case "stop": {
                    await bot.disconnect();
                    process.exit(0);

                    break;
                }

                case "restart": {
                    await bot.restart();

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

                case "reload": {
                    const startTime = performance.now();

                    await bot.disconnect();
                    await bot.settings.reload();
                    await bot.commandLoader.reloadAll();
                    await bot.connect();

                    const endTime = performance.now();

                    console.log(`Reload complete | Took ${Math.round(endTime - startTime) / 1000}s`);

                    break;
                }

                case "clear": {
                    console.clear();

                    break;
                }

                case "help": {
                    console.log("CLI Commands: stop, help, restart, ping, uptime, reload, clear");

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
