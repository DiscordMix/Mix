import {IDisposable, Bot, Command, Log, CommandContext} from "..";
import {EBotEvents} from "../core/bot";
import {IReadonlyCommandMap} from "../commands/command-store";

export default class TempoEngine implements IDisposable {
    private readonly bot: Bot;
    private readonly interval: number;

    private commandsUsed: string[];

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

        this.processInterval = this.bot.setInterval(this.processTempo.bind(this), this.interval);

        return this;
    }

    private async processTempo(): Promise<number> {
        const commands: IReadonlyCommandMap = this.bot.commandStore.getAll();

        let released: number = 0;

        for (let [name, command] of commands) {
            // TODO: .isReleased accepts fileName as identifier, therefore unsafe
            if (!this.bot.internalCommands.includes(name) && !this.commandsUsed.includes(name) && !this.bot.commandStore.isReleased(name)) {
                if (await this.bot.commandStore.release(name)) {
                    released++;
                }
            }
        }

        // TODO: Just commented for debugging
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