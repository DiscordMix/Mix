import DiscordBot from "../bots/discord-bot";
import {IDisposable, ISyncable, IVolatile} from "../core/helpers";
import {IFragment, IFragmentMeta} from "../fragments/fragment";

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
    public readonly abstract meta: IFragmentMeta;

    public readonly interval: number = -1;
    public readonly maxIterations: number = -1;
    public readonly iterations: number = 0;
    public readonly lastIteration: number = -1;

    protected readonly bot: DiscordBot;

    /**
     * @param {DiscordBot} bot
     */
    protected constructor(bot: DiscordBot) {
        /**
         * @type {DiscordBot}
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
