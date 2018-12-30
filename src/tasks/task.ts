import {IFragment, IFragmentMeta} from "../fragments/fragment";
import Bot from "../core/bot";
import {IDisposable, IVolatile, ISyncable} from "../core/helpers";

export interface ITask extends IFragment, IDisposable {
    run(): void;
    canRun(): boolean;

    readonly nextIteration: number;
    readonly lastIterationDifference: number;
    readonly persistent: boolean;
    readonly interval: number;
    readonly maxIterations: number;
    readonly iterations: number;
    readonly lastIteration: number;
}

// TODO: Add ForkedTask class
export default abstract class Task implements ITask {
    public readonly abstract meta: IFragmentMeta;
    
    public readonly interval: number = -1;
    public readonly maxIterations: number = -1;
    public readonly iterations: number = 0;
    public readonly lastIteration: number = -1;

    protected readonly bot: Bot;

    /**
     * @param {Bot} bot
     */
    protected constructor(bot: Bot) {
        /**
         * @type {Bot}
         * @protected
         * @readonly
         */
        this.bot = bot;
    }

    public abstract run(): void;

    /**
     * @return {boolean}
     */
    public canRun(): boolean {
        return true;
    }

    /**
     * Dispose resources used by this task
     */
    public dispose(): void {
        //
    }

    /**
     * Whether the task is persistent
     * @return {boolean}
     */
    public get persistent(): boolean {
        return this instanceof PeristentTask;
    }

    /**
     * @return {number}
     */
    public get lastIterationDifference(): number {
        return Date.now() - this.lastIteration;
    }

    /**
     * @return {number}
     */
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

// TODO: Implement mechanism to handle persistent tasks
export abstract class PeristentTask extends Task implements IPersistentTask {
    public abstract save(): void;
    public abstract sync(): void;
}