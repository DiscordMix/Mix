import {IDisposable, Bot, Command, Log} from "..";
import {EBotEvents} from "../core/bot";
import {IReadonlyCommandMap} from "../commands/command-store";

export default class TempoEngine implements IDisposable {
    private readonly bot: Bot;
    private readonly commandsUsed: string[];
    private readonly interval: number;

    private processInterval: NodeJS.Timeout | null;
    
    // TODO: Interval should be calculated based on amount of commands
    public constructor(bot: Bot, interval: number = 30000) {
        this.bot = bot;
        this.commandsUsed = [];
        this.interval = interval;

        if (this.interval < 60000) {
            Log.warn("[TempoEngine] Interval lower than 1 minute is not suggested");
        }
        else if (this.interval < 30000) {
            this.interval = 30000;
            Log.warn("[TempoEngine] Interval lower than 30 seconds may be inefficient; Using 30 seconds as interval instead");
        }

        this.processInterval = null;
    }

    public start(): this {
        this.bot.on(EBotEvents.CommandExecuted, (command: Command) => {
            this.commandsUsed.push(command.meta.name);
        });

        this.processInterval = this.bot.setTimeout(this.processTempo, this.interval);

        return this;
    }

    private processTempo(): this {
        const commands: IReadonlyCommandMap = this.bot.commandStore.getAll();

        for (let [name, command] of commands) {
            if (!this.commandsUsed.includes(name)) {
                Log.verbose(`[TempoEngine] Releasing command '${name}'`);
                // TODO:
                this.bot.commandStore.unloadAll
            }
        }

        return this;
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