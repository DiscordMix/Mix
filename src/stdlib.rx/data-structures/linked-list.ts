export default class LinkedList<T> {
    protected head: ILinkedListNode<T> | null;
    protected tail: ILinkedListNode<T> | null;

    public constructor() {
        this.head = null;
        this.tail = null;
    }

    public addToHead(value: T): this {
        const newNode: ILinkedListNode<T> = {
            value,
            next: this.head,
            previous: null
        };

        if (this.head !== null) {
            this.head.previous = newNode;
        }
        else {
            this.tail = newNode;
        }

        this.head = newNode;

        return this;
    }

    public addToTail(value: T): this {
        const newNode: ILinkedListNode<T> = {
            value,
            next: null,
            previous: this.tail
        };

        if (this.tail !== null) {
            this.tail.next = newNode;
        }
        else {
            this.head = newNode;
        }

        this.tail = newNode;

        return this;
    }

    public removeHead(): T | null {
        if (this.head === null) {
            return null;
        }

        const value = this.head.value;

        this.head = this.head.next;

        if (this.head !== null) {
            this.head.previous = null;
        }
        else {
            this.tail = null;
        }

        return value;
    }

    public removeTail(): T | null {
        if (this.tail === null) {
            return null;
        }

        const value: T = this.tail.value;

        this.tail = this.tail.previous;

        if (this.tail !== null) {
            this.tail.next = null;
        }
        else {
            this.head = null;
        }

        return value;
    }

    public search(value: T): ILinkedListNode<T> | null {
        let currentNode = this.head;

        while (currentNode) {
            if (currentNode.value === value) {
                return currentNode;
            }

            currentNode = currentNode.next;
        }

        return null;
    }
}

export interface ILinkedListNode<T> {
    readonly value: T;

    next: ILinkedListNode<T> | null;
    previous: ILinkedListNode<T> | null;
}