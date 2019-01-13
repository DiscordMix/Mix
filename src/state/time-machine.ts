import Store, {IStoreAction} from "./store";
import Delta from "./delta";

export interface IStateCapsule<T> {
    readonly state: T;
    readonly time: number;
}

export interface ITimeMachine<T> {
    wayback(): IStateCapsule<T> | null;
    present(): IStateCapsule<T> | null;
    before(time: number): IStateCapsule<T>[];
    after(time: number): IStateCapsule<T>[];
}

export class TimeMachine<TState, TActionType> implements ITimeMachine<TState> {
    protected store: Store<TState, TActionType>;
    protected capsules: IStateCapsule<TState>[];

    public constructor(store: Store<TState, TActionType>) {
        this.store = store;
        this.capsules = [];
        this.setup();
    }

    public wayback(): IStateCapsule<TState> | null {
        return this.capsules[0] || null;
    }

    public present(): IStateCapsule<TState> | null {
        if (this.capsules.length > 0) {
            return this.capsules[this.capsules.length - 1] || null;
        }

        return null;
    }

    public before(time: number): IStateCapsule<TState>[] {
        const result: IStateCapsule<TState>[] = [];

        for (const capsule of this.capsules) {
            if (capsule.time < time) {
                result.push(capsule);
            }
        }

        return result;
    }

    public after(time: number): IStateCapsule<TState>[] {
        const result: IStateCapsule<TState>[] = [];

        for (const capsule of this.capsules) {
            if (capsule.time > time) {
                result.push(capsule);
            }
        }

        return result;
    }

    protected insert(state: TState): this {
        this.capsules.push({
            state,
            time: Date.now()
        });

        return this;
    }

    protected setup(): void {
        const currentState: TState | undefined = this.store.getState();

        if (currentState !== undefined) {
            this.insert(currentState);
        }

        this.store.subscribe((action: IStoreAction, previousState?: TState, newState?: TState) => {
            if (newState === undefined) {
                return;
            }
            // TODO: Should not force cast
            else if (previousState === undefined || Delta.different(previousState as any, newState as any) && newState !== undefined) {
                this.insert(newState);
            }
        });
    }
}
