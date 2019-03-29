import fs from "fs";
import Command from "../commands/command";
import {ReadonlyCommandMap} from "../commands/commandRegistry";
import Bot from "./bot";
import {BotEvent} from "./botExtra";
import {IDisposable} from "./helpers";
import Log from "./log";

export interface IOptimizer extends IDisposable {
    readonly running: boolean;

    start(): this;
    stop(): this;
}

/**
 * Used in large bots for memory optimization.
 */
export default class Optimizer implements IOptimizer {
    protected readonly bot: Bot;
    protected readonly interval: number;
    protected readonly sizeThreshold: number;

    protected commandsUsed: string[];
    protected processInterval: NodeJS.Timeout | null;

    // TODO: Interval should be calculated based on amount of commands.
    public constructor(bot: Bot, interval: number = 10 * 60 * 1000, sizeThreshold: number = 102_400) {
        this.bot = bot;
        this.commandsUsed = [];
        this.interval = interval;
        this.sizeThreshold = sizeThreshold;

        if (this.interval < 60 * 1000) {
            Log.warn("Interval lower than 1 minute is not suggested");
        }
        else if (this.interval < 30 * 1000) {
            this.interval = 30 * 1000;
            Log.warn("Interval lower than 30 seconds may be inefficient; Using 30 seconds as interval instead");
        }

        this.processInterval = null;
    }

    public get running(): boolean {
        return this.processInterval !== null;
    }

    /**
     * Start the engine.
     */
    public start(): this {
        this.bot.on(BotEvent.Command, (command: Command) => {
            this.commandsUsed.push(command.meta.name);
        });

        // Determine if Optimizer should be used.
        const commandPackages: ReadonlyCommandMap = this.bot.registry.getAll();

        let avg: number = 0;

        for (const [name, commandPckg] of commandPackages) {
            avg += fs.statSync(commandPckg.path).size;
        }

        avg = avg / commandPackages.size;

        if (avg < this.sizeThreshold) {
            Log.info("Optimizer is not necessary in this application; Refusing to start");

            return this;
        }

        // Start the interval.
        this.processInterval = this.bot.setInterval(this.process.bind(this), this.interval);

        return this;
    }

    /**
     * Stop the engine.
     */
    public stop(): this {
        this.dispose();

        return this;
    }

    /**
     * Dispose allocated resources.
     */
    public dispose(): void {
        this.bot.removeListener(BotEvent.Command, this.start);

        if (this.processInterval !== null) {
            this.bot.clearInterval(this.processInterval);
        }
    }

    /**
     * Handle performance optimization iterations.
     */
    protected async process(): Promise<number> {
        const commands: ReadonlyCommandMap = this.bot.registry.getAll();

        let released: number = 0;

        for (const [name, command] of commands) {
            if (!this.bot.internalCommands.includes(name as any) && !this.commandsUsed.includes(name) && !this.bot.registry.isReleased(name)) {
                if (await this.bot.registry.release(name)) {
                    released++;
                }
            }
        }

        if (released > 0) {
            Log.verbose(`Released ${released} unused command(s)`);
        }

        this.commandsUsed = [];

        return released;
    }
}
