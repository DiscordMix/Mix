import chalk from "chalk";
import {Guild, GuildMember} from "discord.js";
import {performance} from "perf_hooks";
import readline from "readline";
import {ReadonlyCommandMap} from "../commands/command-store";
import Bot from "../core/bot";
import {DebugMode} from "../core/constants";
import Log from "../core/log";
import Utils from "../core/utils";
import {ReadonlyServiceMap} from "../services/service-manager";

// TODO: Export in index
export type ConsoleCommandHandler = (args: string[]) => void;

export interface IConsoleInterface {
    readonly ready: boolean;

    setup(bot: Bot, registerDefaults: boolean): this;
}

export default class ConsoleInterface {
    public ready: boolean;

    protected readonly commands: Map<string, ConsoleCommandHandler>;

    public constructor() {
        /**
         * Whether the console interface has been successfully setup
         * @type {boolean}
         */
        this.ready = false;

        /**
         * @type {Map<string, ConsoleCommandHandler}
         * @protected
         * @readonly
         */
        this.commands = new Map();
    }

    /**
     * @param {Bot} bot
     * @return {ConsoleInterface}
     */
    public setup(bot: Bot, registerDefaults: boolean = true): this {
        Log.verbose("Setting up console interface");

        const ci = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        ci.setPrompt(`${chalk.cyan.bold(bot.client.user.tag)} > `);
        ci.prompt(true);

        if (registerDefaults) {
            this.defaultCommands(bot);
        }

        // Prompt setup
        ci.on("line", async (input: string) => {
            if (input.startsWith("#")) {
                const id: number = parseInt(input.substr(1));

                if (!isNaN(id)) {
                    if (Log.history[id] !== undefined) {
                        console.log(chalk.gray(input));
                        Log.compose(Log.history[id]);
                    }
                    else {
                        console.log("No such message has been recorded");
                    }
                }
                else {
                    console.log("Invalid input | Expecting number after '#'");
                }

                ci.prompt();

                return;
            }

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
                console.log(chalk.white(`Unknown command: ${input}`));
            }

            ci.prompt();
        });

        // TODO:
        /* ci.on("error", (error: Error) => {
            Log.error(error.message);
        }); */

        ci.on("close", async () => {
            await bot.disconnect();
            process.exit(0);
        });

        // TODO: Should log before setting the prompt
        this.ready = true;
        Log.success("Console interface setup completed");

        return this;
    }

    /**
     * @param {Bot} bot
     * @return {this}
     */
    protected defaultCommands(bot: Bot): this {
        let using: Guild | null = null;

        if (DebugMode) {
            this.commands.set("bug", (args: string[]) => {
                if (args[0] === "commands") {
                    const commands: ReadonlyCommandMap = bot.commandStore.getAll();

                    for (const [base, command] of commands) {
                        console.log(`\n\nCommand: ${base}\n\n`, command);
                    }
                }
                else if (args[0] === "services") {
                    const services: ReadonlyServiceMap = bot.services.getAll();

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
            console.log(bot.client.guilds.map((guild: Guild) => `${guild.name} ${guild.id}`));
        });

        this.commands.set("pid", () => {
            console.log(`Current process running @ ${process.pid.toString()}`);
        });

        this.commands.set("use", (args: string[]) => {
            const guild: string = args[0];

            if (bot.client.guilds.has(guild)) {
                using = bot.client.guilds.get(guild) || null;

                if (using !== null) {
                    console.log(`Using ${using.name} (${using.id})`);
                }
                else {
                    console.log("Guild does not exist in the client");
                }
            }
            else {
                console.log("Guild does not exist in the client");
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
                console.log("Not logged in");

                return;
            }

            console.log(bot.client.user.id);
        });

        this.commands.set("membercount", () => {
            if (using !== null) {
                console.log(`${using.name} has ${using.memberCount} member(s)`);
            }
            else {
                console.log("Not using any guild");
            }
        });

        this.commands.set("member", async (args: string[]) => {
            const memberId: string = args[0];

            if (using !== null) {
                const member: GuildMember | null = await using.member(memberId) || null;

                if (member === null) {
                    console.log(`Guild '${using.name}' does not contain such member`);
                }
                else {
                    console.log(member);
                }
            }
            else {
                console.log("Not using any guild");
            }
        });

        this.commands.set("reload", async () => {
            const startTime: number = performance.now();

            await bot.restart(true);

            // TODO: New fragment system
            // await bot.commandLoader.reloadAll();

            const endTime: number = performance.now();

            Log.success(`Reload complete | Took ${Math.round(endTime - startTime)}ms`);
        });

        this.commands.set("clear", console.clear);

        this.commands.set("help", () => {
            console.log("Available Commands\n");

            // TODO: Also show command description
            for (const [base, command] of this.commands) {
                console.log(chalk.white(`\t${base}`));
            }
        });

        return this;
    }
}
