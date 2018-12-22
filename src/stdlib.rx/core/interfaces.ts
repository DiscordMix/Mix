export interface IDisposable {
    dispose(): void | any;
}

export interface IClonable<T> {
    clone(): T;
}