export interface FragmentMeta {
    readonly name: string;
    readonly description: string;
    readonly author?: string;
    readonly version?: string;
}

export default abstract class Fragment {
    public abstract readonly meta: FragmentMeta;
}