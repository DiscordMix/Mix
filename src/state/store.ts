export interface IStoreAction<T = any> {
    readonly type: StoreActionType;
    readonly payload?: T;
}

export interface IState {
    //
}

export enum StoreActionType {
    Test = -1
}

export type Reducer = (action: IStoreAction) => IState | null;

export type StoreActionHandler = (action: IStoreAction, previousState: IState | undefined, newState: IState | undefined, changed: boolean) => void;

export interface IStateCapsule {
    readonly state: IState;
    readonly time: number;
}

export class TimeMachine {
    protected store: Store;
    protected states: IStateCapsule[];

    public constructor(store: Store) {
        this.store = store;

        this.states = [];
        this.setup();
    }

    public wayback(): IStateCapsule | null {
        return this.states[0] || null;
    }

    public present(): IStateCapsule | null {
        if (this.states.length > 0) {
            return this.states[this.states.length - 1] || null;
        }

        return null;
    }

    protected setup(): void {
        const currentState: IState | undefined = this.store.getState();

        if (currentState !== undefined) {
            this.states.push({
                state: currentState,
                time: Date.now()
            });
        }

        this.store.subscribe((action: IStoreAction, previousState: IState | undefined, newState: IState | undefined, changed: boolean) => {
            if (changed && newState !== undefined) {
                this.states.push({
                    state: newState,
                    time: Date.now()
                });
            }
        });
    }
}

export default class Store {
    public readonly timeMachine: TimeMachine;

    protected readonly handlers: StoreActionHandler[];
    protected readonly reducers: Reducer[];

    protected state?: IState;

    public constructor(initialState?: IState, reducers: Reducer[] = []) {
        this.state = initialState;
        this.handlers = [];
        this.reducers = reducers;
        this.timeMachine = new TimeMachine(this);
    }

    public dispatch(actionOrType: IStoreAction | StoreActionType, payload?: any): this {
        // TODO: Also validate whether type (only) is defined
        if (typeof actionOrType === "object" && payload !== undefined) {
            throw new Error("[Store] Unexpected payload parameter when already provided full action object");
        }
        else if (typeof actionOrType !== "number" && typeof actionOrType !== "object") {
            throw new Error("[Store] Expecting action parameter to be either an action object or an action type");
        }

        const previousState: IState | undefined = this.state;

        const action: IStoreAction = typeof actionOrType === "number" ? {
            type: actionOrType,
            payload
        } : actionOrType;

        let changed: boolean = false;

        for (const reducer of this.reducers) {
            const result: IState | null = reducer(action);

            if (result === undefined) {
                throw new Error("[Store] Reducer must return a state, otherwise return null to indicate no changes");
            }
            else if (result !== null) {
                this.state = result;
                changed = true;
            }
        }

        for (const handler of this.handlers) {
            handler(action, previousState, this.state, changed);
        }

        return this;
    }

    public getState(): IState | undefined {
        return this.state;
    }

    public subscribe(handler: StoreActionHandler): boolean {
        if (!this.isSubscribed(handler)) {
            this.handlers.push(handler);

            return true;
        }

        return false;
    }

    public unsubscribe(handler: StoreActionHandler): boolean {
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

    public isSubscribed(handler: StoreActionHandler): boolean {
        return this.handlers.includes(handler);
    }
}