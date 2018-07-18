export interface PluginMeta {
    readonly name: string;
    readonly desc: string;
    readonly version: string;
    readonly author: string;
    readonly entry: string;
}

export default class Plugin {
    readonly meta: PluginMeta;

    /**
     * @param {PluginMeta} meta
     */
    constructor(meta: PluginMeta) {
        /**
         * @type {PluginMeta}
         * @readonly
         */
        this.meta = meta;
    }
}
