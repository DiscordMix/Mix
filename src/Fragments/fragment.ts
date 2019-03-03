export interface IMeta {
    readonly name: string;
    readonly description?: string;
    readonly author?: string;
    readonly version?: string;
}

export interface IFragment {
    readonly meta: IMeta;
}
