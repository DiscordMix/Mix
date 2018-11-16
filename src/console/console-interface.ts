import Log from "../core/log";
import Utils from "../core/utils";
import Bot, {DebugMode} from "../core/bot";
import readline from "readline";
import {performance} from "perf_hooks";
import {Guild, GuildMember} from "discord.js";
import {IReadonlyCommandMap} from "../commands/command-store";
import {IReadonlyServiceMap} from "../services/service-manager";
import chalk from "chalk";

type ConsoleCommandHandler = (args: string[]) => void;

export default class ConsoleInterface {
    public ready: boolean;

    private readonly commands: Map<string, ConsoleCommandHandler>;

    public constructor() {
        /**
         * Whether the console interface has been successfully setup
         * @type {boolean}
         */
        this.ready = false;

        /**
         * @type {Map<string, ConsoleCommandHandler}
         * @private
         * @readonly
         */
        this.commands = new Map();
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

        ci.setPrompt(`${chalk.cyan.bold(bot.client.user.tag)} > `);
        ci.prompt(true);

        let using: Guild | null = null;

        // Setup Commands
        if (DebugMode) {
            this.commands.set("bug", (args: string[]) => {
                if (args[0] === "commands") {
                    const commands: IReadonlyCommandMap = bot.commandStore.getAll();

                    for (const [base, command] of commands) {
                        console.log(`\n\nCommand: ${base}\n\n`, command);
                    }
                }
                else if (args[0] === "services") {
                    const services: IReadonlyServiceMap = bot.services.getAll();

                    for (const [name, service] of services) {
                        console.log(`\n\nService: ${name}\n\n`, service);
                    }
                }
                else if (args[0] === "config") {
                    console.log("Using bot options:\n\n", bot.options);
                }
                else if (args[0] === "settings") {
                    console.log("Using settings:\n\n", bot.settings);
                }
                else {
                    console.log("Unknown subcommand");
                }
            });
        }

        this.commands.set("ping", () => {
            console.log(`${Math.round(bot.client.ping)}ms`);
        });

        this.commands.set("restart", async () => {
            await bot.restart();
        });

        this.commands.set("stop", async () => {
            await bot.disconnect();
            process.exit(0);
        });

        this.commands.set("uptime", () => {
            // TODO: Time is getting capitalized
            console.log(`Started ${Utils.timeAgoFromNow(bot.client.uptime)}`);
        });

        this.commands.set("guilds", () => {
            console.log("\n" + bot.client.guilds.map((guild: Guild) => `${guild.name} ${guild.id}\n`));
        });

        this.commands.set("use", (args: string[]) => {
            const guild: string = args[0];

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
        });

        this.commands.set("poststats", async () => {
            // TODO: Some way to check if NO key is set
            if (Object.keys(bot.settings.keys).length === 0) {
                console.log("You haven't set any keys!");

                return;
            }

            console.log("Posting stats ...");
            await bot.postStats();
            console.log("Posted stats");
        });

        this.commands.set("id", () => {
            if (!bot.client.user) {
                console.log("Not logged in!");

                return;
            }
            
            console.log(`My ID is => ${bot.client.user.id}`);
        });

        this.commands.set("membercount", () => {
            if (using !== null) {
                console.log(`\n${using.name} has ${using.memberCount} member(s)\n`);
            }
            else {
                console.log(`\nNot using any guild\n`);
            }
        });

        this.commands.set("member", async (args: string[]) => {
            const memberId: string = args[0];

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
        });

        this.commands.set("reload", async () => {
            const startTime: number = performance.now();

            await bot.restart(true);

            // TODO: New fragment system
            // await bot.commandLoader.reloadAll();

            const endTime: number = performance.now();

            Log.success(`[CLI.reload] Reload complete | Took ${Math.round(endTime - startTime)}ms`);
        });

        this.commands.set("clear", console.clear);

        this.commands.set("help", () => {
            console.log("\nAvailable Commands\n");

            // TODO: Also show command description
            for (let [base, command] of this.commands) {
                console.log(chalk.white(`\t${base}`));
            }

            console.log("");
        });

        // Prompt setup
        ci.on("line", async (input: string) => {
            const args: string[] = input.trim().split(" ");
            const base: string = args[0].trim();

            args.splice(0, 1);

            if (base === "") {
                ci.prompt();

                return;
            }

            if (this.commands.has(base)) {
                await (this.commands.get(base) as ConsoleCommandHandler)(args);
            }
            else {
                console.log(chalk.white(`\nUnknown command: ${input}\n`));
            }

            ci.prompt();
        });

        // TODO:
        /* ci.on("error", (error: Error) => {
            Log.error(error.message);
        }); */

        // TODO: Disabled due to directly exiting on vps/linux
        /* ci.on("close", async () => {
            await bot.disconnect();
            process.exit(0);
        }); */

        // TODO: Should log before setting the prompt
        this.ready = true;
        Log.success("[ConsoleInterface.setup] Console interface setup completed");

        return this;
    }
}
