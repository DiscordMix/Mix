import Log from "../core/log";
import Utils from "../core/utils";
import Bot from "../core/bot";
import readline from "readline";
import {performance} from "perf_hooks";
import {Guild, GuildMember} from "discord.js";

export default class ConsoleInterface {
    public ready: boolean;

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
    public setup(bot: Bot): ConsoleInterface {
        Log.verbose("[ConsoleInterface] Setting up console interface");

        const ci = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        ci.setPrompt(`${bot.client.user.tag} > `);
        ci.prompt(true);

        let using: Guild | null = null;

        ci.on("line", async (input: string) => {
            switch (input.trim().toLowerCase()) {
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

                case "guilds": {
                    console.log("\n" + bot.client.guilds.map((guild: Guild) => `${guild.name} ${guild.id}\n`));

                    break;
                }

                case "use": {
                    const guild: string = input.trim().split(" ")[1];

                    if (bot.client.guilds.has(guild)) {
                        using = bot.client.guilds.get(guild) || null;

                        if (using !== null) {
                            console.log(`\nUsing ${using.name} (${using.id})\n`);
                        }
                        else {
                            console.log("\nGuild does not exist in the client\n");
                        }
                    }
                    else {
                        console.log("\nGuild does not exist in the client\n");
                    }

                    break;
                }

                case "membercount": {
                    if (using !== null) {
                        console.log(`\n${using.name} has ${using.memberCount} member(s)\n`);
                    }
                    else {
                        console.log(`\nNot using any guild\n`);
                    }

                    break;
                }

                case "member": {
                    const memberId: string = input.trim().split(" ")[1];

                    if (using !== null) {
                        const member: GuildMember | null = await using.member(memberId) || null;

                        if (member === null) {
                            console.log(`\nGuild '${using.name}' does not contain such member\n`);
                        }
                        else {
                            console.log("\n", member, "\n");
                        }
                    }
                    else {
                        console.log(`\nNot using any guild\n`);
                    }

                    break;
                }

                case "reload": {
                    const startTime: number = performance.now();

                    await bot.disconnect();

                    // TODO: New fragment system
                    // await bot.commandLoader.reloadAll();

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
