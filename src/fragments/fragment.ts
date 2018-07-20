export interface FragmentMeta {
    readonly name: string;
    readonly description: string;
}

export default abstract class Fragment {
    public abstract readonly meta: FragmentMeta;
}