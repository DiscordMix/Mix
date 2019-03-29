import Bot from "../core/bot";
import {IDisposable, ISyncable, IVolatile} from "../util/helpers";
import {IFragment, IMeta} from "../fragments/fragment";

export interface ITask extends IFragment, IDisposable {
    readonly nextIteration: number;
    readonly lastIterationDifference: number;
    readonly interval: number;
    readonly maxIterations: number;
    readonly iterations: number;
    readonly lastIteration: number;

    run(): void;
    canRun(): boolean;
}

// TODO: Add ForkedTask class?
export default abstract class Task implements ITask {
    public readonly abstract meta: IMeta;

    public readonly interval: number = -1;
    public readonly maxIterations: number = -1;
    public readonly iterations: number = 0;
    public readonly lastIteration: number = -1;

    protected readonly bot: Bot;

    protected constructor(bot: Bot) {
        this.bot = bot;
    }

    public abstract run(): void;

    public canRun(): boolean {
        return true;
    }

    /**
     * Dispose resources used by this task.
     */
    public dispose(): void {
        //
    }

    public get lastIterationDifference(): number {
        return Date.now() - this.lastIteration;
    }

    public get nextIteration(): number {
        if (this.interval === -1) {
            return -1;
        }

        return this.lastIteration + this.interval;
    }
}

export interface IPersistentTask extends ITask, IVolatile, ISyncable {
    //
}
