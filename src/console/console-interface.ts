import Log from "../core/log";
import Utils from "../core/utils";
import Bot from "../core/bot";

const readline = require("readline");
const { performance } = require("perf_hooks");

export default class ConsoleInterface {
    ready: boolean;

    constructor() {
        /**
         * Whether the console interface has been successfully setup
         * @type {boolean}
         */
        this.ready = false;
    }

    /**
     * @param {Bot} bot
     * @return {ConsoleInterface}
     */
    setup(bot: Bot): ConsoleInterface {
        Log.verbose("[ConsoleInterface] Setting up console interface");

        const ci = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        ci.prompt(true);

        ci.on("line", async (input: string) => {
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
                    console.log(`${Math.round(bot.client.ping)}ms`);

                    break;
                }

                case "uptime": {
                    console.log(`Started ${Utils.timeAgoFromNow(bot.client.uptime)}`);

                    break;
                }

                case "reload": {
                    const startTime = performance.now();

                    await bot.disconnect();
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

        return this;
    }
}
