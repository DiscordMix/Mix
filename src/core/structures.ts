export type IDisposable = {
    dispose(): Promise<any> | any;
}

export type IVolatile = {
    save(): Promise<any> | any;
}

export type IReloadable = {
    reload(): Promise<any> | any;
}
