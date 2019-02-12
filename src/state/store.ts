import BotMessages from "../core/messages";
import {ITimeMachine, TimeMachine} from "./time-machine";
import Log from "../core/log";

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

export type StoreActionHandler<T> = (action: IStoreAction, previousState?: T, newState?: T) => void;

export interface IStore<TState = any, TActionType = any> {
    readonly timeMachine: ITimeMachine<TState>;

    dispatch<T = any>(type: TActionType, payload?: T): this;
    getState(): TState | undefined;
    subscribe(handler: StoreActionHandler<TState>): boolean;
    unsubscribe(handler: StoreActionHandler<TState>): boolean;
    unsubscribeAll(): this;
    isSubscribed(handler: StoreActionHandler<TState>): boolean;
    addReducer(reducer: Reducer<TState>): boolean;
}

/**
 * Provides state and data management for bots.
 */
export default class Store<TState = any, TActionType = any> {
    /**
     * Combine multiple reducers into a single method.
     */
    public static mergeReducers<T = any>(...reducers: Reducer<T>[]): Reducer<T> {
        return (action: IStoreAction, state?: T): T | null => {
            let finalState: T | undefined = state;

            for (const reducer of reducers) {
                const newState: T | null = reducer(action, finalState);

                if (newState !== null) {
                    finalState = newState;
                }
            }

            return finalState !== undefined ? finalState : null;
        };
    }

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

    /**
     * Dispatch a store event.
     */
    public dispatch<T = any>(type: TActionType, payload?: T): this {
        if (typeof type !== "number" && typeof type !== "string") {
            throw Log.error(BotMessages.STORE_INVALID_ACTION);
        }

        const previousState: TState | undefined = this.state;

        const action: IStoreAction = {
            type,
            payload
        };

        for (const reducer of this.reducers) {
            const result: TState | null = reducer(action, this.state);

            if (result === undefined) {
                throw Log.error(BotMessages.STORE_REDUCER_NO_UNDEFINED);
            }
            else if (result !== null) {
                this.state = result;
            }
        }

        for (const handler of this.handlers) {
            handler(action, previousState, this.state);
        }

        return this;
    }

    /**
     * Retrieve the current state of the store.
     */
    public getState(): TState | undefined {
        return this.state;
    }

    /**
     * Subscribe a event handler to listen for state changes.
     */
    public subscribe(handler: StoreActionHandler<TState>): boolean {
        if (typeof handler !== "function") {
            throw Log.error(BotMessages.STORE_EXPECT_HANDLER_FUNC);
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
            throw Log.error(BotMessages.STORE_EXPECT_HANDLER_FUNC);
        }

        return this.handlers.includes(handler);
    }

    public addReducer(reducer: Reducer<TState>): boolean {
        if (typeof reducer !== "function") {
            throw Log.error(BotMessages.STORE_EXPECT_REDUCER_FUNC);
        }
        else if (!this.reducers.includes(reducer)) {
            this.reducers.push(reducer);

            return true;
        }

        return false;
    }
}
