import {EventEmitter} from "events";

export type EventEmitterListener = (...args: any[]) => void;

export interface IUniversalClient {
    // TODO
}

export interface IEventEmitter<T extends string> extends EventEmitter {
    on(event: T, listener: EventEmitterListener): this;
    once(event: T, listener: EventEmitterListener): this;
    emit(event: T, ...args: any[]): boolean;
}
