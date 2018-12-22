export interface IQueue<T> {
    enqueue(item: T): void;
    dequeue(): T | null;
    first(): T | null;
    last(): T | null;
    size: number;
}

export default class Queue<T> implements IQueue<T> {
    protected items: T[];

    public constructor(items: T[] = []) {
        this.items = items;
    }

    public enqueue(item: T): this {
        this.items.unshift(item);

        return this;
    }

    public dequeue(): T | null {
        return this.items.pop() || null;
    }

    public first(): T | null {
        return this.items[0] || null;
    }

    public last(): T | null {
        return this.items[this.items.length - 1] || null;
    }

    public get size(): number {
        return this.items.length;
    }
}