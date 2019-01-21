import {EventEmitter} from "events";
import {PromiseOr} from "@atlas/xlib";

export type EventEmitterListener = (...args: any[]) => void;

export interface IUniversalClient<T extends string = string> extends IEventEmitter<T> {
    setup(): PromiseOr<void>;
    destroy(): PromiseOr<void>;
}

export interface IEventEmitter<T extends string> extends EventEmitter {
    on(event: T, listener: EventEmitterListener): this;
    once(event: T, listener: EventEmitterListener): this;
    emit(event: T, ...args: any[]): boolean;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;
    off(event: T, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: T): this;
}
