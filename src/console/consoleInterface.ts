import chalk from "chalk";
import {Guild, GuildMember} from "discord.js";
import {performance} from "perf_hooks";
import readline from "readline";
import {ReadonlyCommandMap} from "../commands/commandRegistry";
import {debugMode} from "../core/constants";
import Log from "../core/log";
import Util from "../util/util";
import {ReadonlyServiceMap} from "../services/serviceManager";
import {IBot} from "../core/botExtra";
import os from "os";

// TODO: Export in index.
export type ConsoleCommandHandler = (args: string[]) => void;

export interface IConsoleInterface {
    readonly ready: boolean;

    setup(registerDefaults: boolean): this;
}

export default class ConsoleInterface implements IConsoleInterface {
    /**
     * Whether the console interface has been
     * successfully setup.
     */
    public ready: boolean;

    protected readonly bot: IBot;
    protected readonly commands: Map<string, ConsoleCommandHandler>;

    protected ci!: readline.Interface;
    protected prompt: string;

    public constructor(bot: IBot) {
        this.bot = bot;
        this.ready = false;
        this.commands = new Map();

        // At this point, the client has not logged in.
        this.prompt = `${os.userInfo().username} > `;
    }

    /**
     * Setup and initialize the console interface
     * module.
     */
    public setup(registerDefaults: boolean = true): this {
        Log.verbose("Setting up console interface");

        // Update prompt with the bot's user tag.
        this.prompt = `${chalk.cyan.bold(this.bot.client.user.tag)} > `;

        this.ci = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.ci.setPrompt(`${chalk.cyan.bold(this.bot.client.user.tag)} > `);
        this.ci.prompt(true);

        if (registerDefaults) {
            this.defaultCommands();
        }

        // Prompt setup.
        this.ci.on("line", this.handleLine.bind(this));

        // TODO
        /* ci.on("error", (error: Error) => {
            Log.error(error.message);
        }); */

        this.ci.on("close", async () => {
            await this.bot.disconnect();
            process.exit(0);
        });

        // TODO: Should log before setting the prompt.
        this.ready = true;
        Log.success("Console interface setup completed");

        return this;
    }

    protected async handleLine(input: string): Promise<void> {
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

            this.ci.prompt();

            return;
        }

        const args: string[] = input.trim().split(" ");
        const base: string = args[0].trim();

        args.splice(0, 1);

        if (base === "") {
            this.ci.prompt();

            return;
        }

        if (this.commands.has(base)) {
            await this.commands.get(base)!(args);
        }
        else {
            console.log(chalk.white(`Unknown command: ${input}`));
        }

        this.ci.prompt();
    }

    protected defaultCommands(): this {
        let using: Guild | null = null;

        if (debugMode) {
            this.commands.set("bug", (args: string[]) => {
                if (args[0] === "commands") {
                    const commands: ReadonlyCommandMap = this.bot.registry.getAll();

                    for (const [base, command] of commands) {
                        console.log(`\n\nCommand: ${base}\n\n`, command);
                    }
                }
                else if (args[0] === "services") {
                    const services: ReadonlyServiceMap = this.bot.services.getAll();

                    for (const [name, service] of services) {
                        console.log(`\n\nService: ${name}\n\n`, service);
                    }
                }
                else if (args[0] === "opts") {
                    console.log("Using bot options:\n\n", this.bot.options);
                }
                else {
                    console.log("Unknown subcommand");
                }
            });
        }

        this.commands.set("ping", () => {
            console.log(`${Math.round(this.bot.client.ping)}ms`);
        });

        this.commands.set("restart", async () => {
            await this.bot.reconnect(true);
        });

        this.commands.set("stop", async () => {
            await this.bot.disconnect();
            process.exit(0);
        });

        this.commands.set("uptime", () => {
            // TODO: Time is getting capitalized.
            console.log(`Started ${Util.timeAgoFromNow(this.bot.client.uptime)}`);
        });

        this.commands.set("guilds", () => {
            console.log(this.bot.client.guilds.map((guild: Guild) => `${guild.name} ${guild.id}`));
        });

        this.commands.set("pid", () => {
            console.log(`Current process running @ ${process.pid.toString()}`);
        });

        this.commands.set("use", (args: string[]) => {
            const guild: string = args[0];

            if (this.bot.client.guilds.has(guild)) {
                using = this.bot.client.guilds.get(guild) || null;

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
            // TODO: Some way to check if NO key is set.
            if (Object.keys(this.bot.options.keys).length === 0) {
                console.log("You haven't set any keys!");

                return;
            }

            console.log("Posting stats ...");
            await this.bot.postStats();
            console.log("Posted stats");
        });

        this.commands.set("id", () => {
            if (!this.bot.client.user) {
                console.log("Not logged in");

                return;
            }

            console.log(this.bot.client.user.id);
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

            await this.bot.reload();

            // TODO: New fragment system.
            // await bot.commandLoader.reloadAll();

            const endTime: number = performance.now();

            Log.success(`Reload complete | Took ${Math.round(endTime - startTime)}ms`);
        });

        this.commands.set("clear", console.clear);

        this.commands.set("help", () => {
            console.log("Available Commands\n");

            // TODO: Also show command description.
            for (const [base, command] of this.commands) {
                console.log(chalk.white(`\t${base}`));
            }
        });

        return this;
    }
}
