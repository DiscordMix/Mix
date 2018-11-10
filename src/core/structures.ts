export type IDisposable = {
    dispose(): Promise<any> | any;
}

export type IVolatile = {
    save(): Promise<any> | any;
}

export type ISyncable = {
    sync(): Promise<any> | any;
}
