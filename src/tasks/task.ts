import {IFragment, IFragmentMeta} from "../fragments/fragment";
import Bot from "../core/bot";
import {IDisposable} from "../core/structures";

export abstract class Task implements IFragment, IDisposable {
    public readonly abstract meta: IFragmentMeta;
    
    public readonly interval: number = -1;
    public readonly maxIterations: number = -1;
    public readonly iterations: number = 0;
    public readonly lastIteration: number = -1;

    public abstract run(bot: Bot): void;

    public canRun(bot: Bot): boolean {
        return true;
    }

    public dispose(): void {
        //
    }

    public get lastIterationDifference(): number {
        return Date.now() - this.lastIteration;
    }
};