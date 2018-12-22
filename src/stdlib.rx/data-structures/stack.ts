export default class Stack<T> {
    protected items: T[];

    public constructor(items: T[] = []) {
        this.items = items;
    }

    public push(item: T): this {
        this.items.push(item);

        return this;
    }

    public pop(): T | null {
        return this.items.pop() || null;
    }

    public peek(): T | null {
        return this.items[this.items.length - 1] || null;
    }

    public get empty(): boolean {
        return this.items.length > 0;
    }

    public print(separator: string = " "): string {
        let result: string = "";

        for (let i: number = 0; i < this.items.length; i++) {
            result += this.items[i].toString() + separator;
        }

        return result;
    }
}