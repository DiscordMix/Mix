import {PromiseOr, IProvider} from "../providers/provider";
import {ITimeoutAttachable} from "../core/helpers";

export interface ITransaction<ItemType, ReturnType = boolean> extends IProvider<ItemType> {
    commit(): PromiseOr<ReturnType>;
}

export type ICachedTransaction<CacheType = any[]> = {
    readonly cache: CacheType;
}

export abstract class AutoTransaction<ItemType, CacheType = ItemType[], ReturnType = boolean> implements ITransaction<ItemType, ReturnType>, ICachedTransaction<CacheType> {
    public abstract readonly cache: CacheType;

    protected constructor(attachable: ITimeoutAttachable, time: number) {
        attachable.setInterval(this.commit.bind(this), time);
    }

    public abstract commit(): PromiseOr<ReturnType>;
    
    public abstract get(key: string): PromiseOr<ItemType | null>;

    public abstract set(key: string, value: ItemType): PromiseOr<boolean>;

    public abstract has(key: string): PromiseOr<boolean>;
}