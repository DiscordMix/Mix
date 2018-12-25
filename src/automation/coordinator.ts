import {PromiseOr} from "..";

export type Operation = () => PromiseOr<boolean>;

export enum CoordinatorState {
    OK,
    Failed
}

export interface ICoordinatorRunResult {
    readonly state: CoordinatorState;
    readonly operations: number;
    readonly operationsCompleted: number;
    readonly time: number;
    readonly averageTime: number;
}

export class Coordinator {
    protected operations: Operation[];
    protected isRunning: boolean;

    public constructor(...operations: Operation[]) {
        this.operations = operations !== undefined && Array.isArray(operations) ? operations : [];
        this.isRunning = false;
    }

    public then(op: Operation): this {
        if (this.isRunning) {
            throw new Error("Cannot append operation while running");
        }

        this.operations.push(op);

        return this;
    }

    public get running(): boolean {
        return this.isRunning;
    }

    // TOOD: Better report of why failed/completed
    public async run(): Promise<ICoordinatorRunResult> {
        if (this.isRunning) {
            throw new Error("Cannot run; Already running");
        }

        this.isRunning = true;

        let completed: number = 0;

        const pending: ICoordinatorRunResult = {
            operations: this.operations.length,
            time: 0,
            averageTime: 0,
            operationsCompleted: 0,
            state: CoordinatorState.Failed
        };

        for (const op of this.operations) {
            const start: number = performance.now();
            const result: PromiseOr<boolean> = op();
            const time: number = performance.now() - start;

            if (result instanceof Promise) {
                await result;
            }
            else if (!result) {
                this.isRunning = false;

                return {
                    ...pending,
                    state: CoordinatorState.Failed,
                    operationsCompleted: completed,
                    averageTime: pending.time / completed
                };
            }

            // TODO: Read-only hotfix
            (pending.time as any) += time;
            completed++;
        }

        this.isRunning = false;

        return {
            ...pending,
            state: CoordinatorState.OK,
            operationsCompleted: completed,
            averageTime: pending.time / completed
        };
    }

    public clear(): this {
        if (this.isRunning) {
            throw new Error("Cannot clear operations while running");
        }

        this.operations.length = 0;

        return this;
    }
}