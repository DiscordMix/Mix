import {IFragment, IFragmentMeta} from "../fragments/fragment";
import Bot from "../core/bot";
import {IDisposable} from "../core/structures";

// TODO: Add DetachedTask class
export default abstract class Task implements IFragment, IDisposable {
    public readonly abstract meta: IFragmentMeta;
    
    public readonly interval: number = -1;
    public readonly maxIterations: number = -1;
    public readonly iterations: number = 0;
    public readonly lastIteration: number = -1;

    protected readonly bot: Bot;

    /**
     * 
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