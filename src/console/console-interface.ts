import Log from "../core/log";
import Utils from "../core/utils";
import Bot from "../core/bot";
import readline from "readline";
import {performance} from "perf_hooks";
import {Guild, GuildMember} from "discord.js";

type ConsoleCommandHandler = (args: string[]) => void;

export default class ConsoleInterface {
    public ready: boolean;

    private readonly commands: Map<string, ConsoleCommandHandler>;

    constructor() {
        /**
         * Whether the console interface has been successfully setup
         * @type {boolean}
         */
        this.ready = false;

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

        ci.setPrompt(`${bot.client.user.tag} > `);
        ci.prompt(true);

        let using: Guild | null = null;

        // Setup Commands
        this.commands.set("bug", (args: string[]) => {

        });

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
            console.log(`Started ${Utils.timeAgo(bot.client.uptime, false)}`);
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

            await bot.disconnect();

            // TODO: New fragment system
            // await bot.commandLoader.reloadAll();

            await bot.connect();

            const endTime = performance.now();

            console.log(`Reload complete | Took ${Math.round(endTime - startTime) / 1000}s`);
        });

        this.commands.set("clear", console.clear);

        this.commands.set("help", () => {
            console.log("CLI Commands: stop, help, restart, ping, uptime, reload, clear");
        });

        // Old Setup
        ci.on("line", async (input: string) => {
            const args: string[] = input.trim().split(" ");
            const base: string = args[0];

            args.splice(0, 1);

            if (base === "") {
                return;
            }

            if (this.commands.has(base)) {
                (this.commands.get(base) as ConsoleCommandHandler)(args);
            }
            else {
                console.log(`Unknown command: ${input}`);
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
