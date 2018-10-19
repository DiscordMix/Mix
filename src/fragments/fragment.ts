export type IFragmentMeta = {
    readonly name: string;
    readonly description: string;
    readonly author?: string;
    readonly version?: string;
}

export interface IFragment {
    readonly meta: IFragmentMeta;
}

export default abstract class Fragment {
    public abstract readonly meta: IFragmentMeta;
}
