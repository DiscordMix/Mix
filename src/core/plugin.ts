import {IFragment, IFragmentMeta} from "../fragments/fragment";

export interface IPluginMeta extends IFragmentMeta {
    readonly entry: string;
}

export default class Plugin implements IFragment {
    public readonly meta: IPluginMeta;

    /**
     * @param {IPluginMeta} meta
     */
    public constructor(meta: IPluginMeta) {
        /**
         * @type {IPluginMeta}
         * @readonly
         */
        this.meta = meta;
    }
}
