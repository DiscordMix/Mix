import BotMessages from "../core/messages";

export interface IStoreAction<T = any> {
    readonly type: number | string;
    readonly payload?: T;
}

export interface ITestState {
    readonly $$test?: string;
}

export enum TestStoreActionType {
    $$Test = -1
}

export type Reducer<T> = (action: IStoreAction, state?: T) => T | null;

export type StoreActionHandler<T> = (action: IStoreAction, changed: boolean, previousState?: T, newState?: T) => void;

export interface IStateCapsule<T> {
    readonly state: T;
    readonly time: number;
}

export abstract class Delta {
    /**
     * Compare two objects's properties without recursion
     * @param entity1
     * @param entity2
     * @return {string[]} The changes
     */
    public static compare(entity1: object, entity2: object): string[] {
        const deltas: string[] = [];
        const keys: string[] = Object.keys(entity1);
        const keys2: string[] = Object.keys(entity2);

        for (let i: number = 0; i < keys2.length; i++) {
            if (!keys.includes(keys2[i])) {
                keys.push(keys2[i]);
            }
        }

        for (let i: number = 0; i < keys.length; i++) {
            const key: string = keys[i];

            if (!entity2.hasOwnProperty(key) || entity2[key] !== entity1[key]) {
                deltas.push(key);
            }
        }

        return deltas;
    }
}

export class TimeMachine<TState, TActionType> {
    protected store: Store<TState, TActionType>;
    protected capsules: IStateCapsule<TState>[];

    public constructor(store: Store<TState, TActionType>) {
        this.store = store;
        this.capsules = [];
        this.setup();
    }

    protected insert(state: TState): this {
        this.capsules.push({
            state,
            time: Date.now()
        });

        return this;
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

    protected setup(): void {
        const currentState: TState | undefined = this.store.getState();

        if (currentState !== undefined) {
            this.insert(currentState);
        }

        this.store.subscribe((action: IStoreAction, changed: boolean, previousState?: TState, newState?: TState) => {
            if (changed && newState !== undefined) {
                this.insert(newState);
            }
        });
    }
}

export default class Store<TState, TActionType> {
    public readonly timeMachine: TimeMachine<TState, TActionType>;

    protected readonly handlers: StoreActionHandler<TState>[];
    protected readonly reducers: Reducer<TState>[];

    protected state?: TState;

    public constructor(initialState?: TState, reducers: Reducer<TState>[] = []) {
        this.state = initialState;
        this.handlers = [];
        this.reducers = reducers;
        this.timeMachine = new TimeMachine(this);
    }

    public dispatch<T = any>(type: TActionType, payload?: T): this {
        if (typeof type !== "number" && typeof type !== "string") {
            throw new Error(BotMessages.STORE_INVALID_ACTION);
        }

        const previousState: TState | undefined = this.state;

        const action: IStoreAction = {
            type,
            payload
        };

        let changed: boolean = false;

        for (const reducer of this.reducers) {
            const result: TState | null = reducer(action, this.state);

            if (result === undefined) {
                throw new Error(BotMessages.STORE_REDUCER_NO_UNDEFINED);
            }
            else if (result !== null) {
                this.state = result;
                changed = true;
            }
        }

        for (const handler of this.handlers) {
            handler(action, changed, previousState, this.state);
        }

        return this;
    }

    public getState(): TState | undefined {
        return this.state;
    }

    public subscribe(handler: StoreActionHandler<TState>): boolean {
        if (typeof handler !== "function") {
            throw new Error(BotMessages.STORE_EXPECT_HANDLER_FUNC);
        }
        else if (!this.isSubscribed(handler)) {
            this.handlers.push(handler);

            return true;
        }

        return false;
    }

    public unsubscribe(handler: StoreActionHandler<TState>): boolean {
        if (this.handlers.includes(handler)) {
            this.handlers.splice(this.handlers.indexOf(handler), 1);

            return true;
        }

        return false;
    }

    public unsubscribeAll(): this {
        this.handlers.length = 0;

        return this;
    }

    public isSubscribed(handler: StoreActionHandler<TState>): boolean {
        if (typeof handler !== "function") {
            throw new Error(BotMessages.STORE_EXPECT_HANDLER_FUNC);
        }

        return this.handlers.includes(handler);
    }

    public addReducer(reducer: Reducer<TState>): boolean {
        if (typeof reducer !== "function") {
            throw new Error(BotMessages.STORE_EXPECT_REDUCER_FUNC);
        }
        else if (!this.reducers.includes(reducer)) {
            this.reducers.push(reducer);

            return true;
        }

        return false;
    }
}