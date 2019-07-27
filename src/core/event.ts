export default class Event<T = any> {
    public readonly name: string;

    public data: T;

    protected prevented: boolean;

    public constructor(name: string, data: T) {
        this.name = name;
        this.data = data;
        this.prevented = false;
    }

    public prevent(): void {
        this.prevented = true;
    }

    public get isPrevented(): boolean {
        return this.prevented;
    }
}

export enum EventName {
    Message = "message"
}
