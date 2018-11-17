import {IDisposable, Bot, Command, Log, CommandContext} from "..";
import {EBotEvents} from "../core/bot";
import {IReadonlyCommandMap, ICommandPackage} from "../commands/command-store";
import fs from "fs";

export default class TempoEngine implements IDisposable {
    private readonly bot: Bot;
    private readonly interval: number;
    private readonly sizeThreshold: number;

    private commandsUsed: string[];

    private processInterval: NodeJS.Timeout | null;
    
    // TODO: Interval should be calculated based on amount of commands
    public constructor(bot: Bot, interval: number = 30000, sizeThreshold: number = 102400) {
        this.bot = bot;
        this.commandsUsed = [];
        this.interval = interval;
        this.sizeThreshold = sizeThreshold;

        if (this.interval < 60000) {
            Log.warn("[TempoEngine] Interval lower than 1 minute is not suggested");
        }
        else if (this.interval < 30000) {
            this.interval = 30000;
            Log.warn("[TempoEngine] Interval lower than 30 seconds may be inefficient; Using 30 seconds as interval instead");
        }

        this.processInterval = null;
    }

    public get running(): boolean {
        return this.processInterval !== null;
    }

    public start(): this {
        this.bot.on(EBotEvents.CommandExecuted, (command: Command) => {
            this.commandsUsed.push(command.meta.name);
        });

        // Determine if Tempo Engine should be used
        const commandPackages: IReadonlyCommandMap = this.bot.commandStore.getAll();

        let avg: number = 0;

        for (let [name, commandPckg] of commandPackages) {
            avg += fs.statSync(commandPckg.path).size;
        }

        avg = avg / commandPackages.size;

        if (avg < this.sizeThreshold) {
            Log.info("[TempoEngine] Tempo Engine is not necessary in this application; Refusing to start");

            return this;
        }

        // Start the interval
        this.processInterval = this.bot.setInterval(this.processTempo.bind(this), this.interval);

        return this;
    }

    private async processTempo(): Promise<number> {
        const commands: IReadonlyCommandMap = this.bot.commandStore.getAll();

        let released: number = 0;

        for (let [name, command] of commands) {
            if (!this.bot.internalCommands.includes(name) && !this.commandsUsed.includes(name) && !this.bot.commandStore.isReleased(name)) {
                if (await this.bot.commandStore.release(name)) {
                    released++;
                }
            }
        }

        if (released > 0) {
            Log.verbose(`[TempoEngine] Released ${released} unused command(s)`);
        }

        this.commandsUsed = [];

        return released;
    }

    public stop(): this {
        this.dispose();

        return this;
    }

    public dispose(): void {
        this.bot.removeListener(EBotEvents.CommandExecuted, this.start);

        if (this.processInterval !== null) {
            this.bot.clearInterval(this.processInterval);
        }
    }
}