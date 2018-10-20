export type IFragmentMeta = {
    readonly name: string;
    readonly description: string;
    readonly author?: string;
    readonly version?: string;
}

export type IFragment = {
    readonly meta: IFragmentMeta;
}
