import {IFragment, IFragmentMeta} from "../fragments/fragment";
import Bot from "../core/bot";
import {IDisposable} from "../core/snap";

export abstract class Task implements IFragment, IDisposable {
    public readonly abstract meta: IFragmentMeta;
    public readonly abstract interval: number;

    public readonly maxIterations: number = -1;
    public readonly iterations: number = 0;
    public readonly lastIteration: number = -1;

    public abstract run(bot: Bot): void;

    public canRun(bot: Bot): boolean {
        return true;
    }

    public canEnable(bot: Bot): boolean {
        return true;
    }

    public enable(bot: Bot): void {
        //
    }

    public disable(bot: Bot): void {
        //
    }

    public dispose(): void {
        //
    }
};