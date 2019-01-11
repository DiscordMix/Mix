import {ITimeoutAttachable} from "../core/helpers";
import {IProvider, PromiseOr} from "../providers/provider";

export interface ITransaction<ItemType, ReturnType = boolean> extends IProvider<ItemType> {
    commit(): PromiseOr<ReturnType>;
}

export interface ICachedTransaction<T = any[]> {
    readonly cache: T;
}

export abstract class AutoTransaction<TItem, TCache = TItem[], TReturn = boolean> implements ITransaction<TItem, TReturn>, ICachedTransaction<TCache> {
    public abstract readonly cache: TCache;

    protected constructor(attachable: ITimeoutAttachable, time: number) {
        attachable.setInterval(this.commit.bind(this), time);
    }

    public abstract commit(): PromiseOr<TReturn>;

    public abstract get(key: string): PromiseOr<TItem | null>;

    public abstract set(key: string, value: TItem): PromiseOr<boolean>;

    public abstract has(key: string): PromiseOr<boolean>;
}
