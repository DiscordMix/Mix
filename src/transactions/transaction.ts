import {PromiseOr, IProvider} from "../providers/provider";
import {ITimeoutAttachable} from "../core/structures";

export interface ITransaction<ItemType> extends IProvider<ItemType> {
    commit(): PromiseOr<boolean>;
}

export abstract class AutomatedTransaction<ItemType> implements ITransaction<ItemType> {
    protected constructor(attachable: ITimeoutAttachable, time: number) {
        attachable.setInterval(this.commit, time);
    }

    public abstract commit(): PromiseOr<boolean>;
    
    public abstract get(key: string): ItemType | null;

    public abstract set(key: string, value: ItemType): boolean;
}