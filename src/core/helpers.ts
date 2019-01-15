import {PromiseOr} from "@atlas/xlib";

export interface IDisposable<T = any> {
    dispose(): PromiseOr<T>;
}

export interface IVolatile<T = any> {
    save(): PromiseOr<T>;
}

export interface ITimeoutAttachable {
    setTimeout(action: any, time: number): PromiseOr<NodeJS.Timeout>;
    setInterval(action: any, time: number): PromiseOr<NodeJS.Timeout>;
}

export interface ISyncable<T = any> {
    sync(): PromiseOr<T>;
}
