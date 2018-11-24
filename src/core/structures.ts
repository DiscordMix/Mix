import {PromiseOr} from "../providers/provider";

export type IDisposable = {
    dispose(): Promise<any> | any;
}

export type IVolatile = {
    save(): Promise<any> | any;
}

export type ITimeoutAttachable = {
    setTimeout(action: any, time: number): PromiseOr<NodeJS.Timeout>;

    setInterval(action: any, time: number): PromiseOr<NodeJS.Timeout>;
}

export type ISyncable = {
    sync(): Promise<any> | any;
}
