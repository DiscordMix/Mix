export interface PluginMeta {
    readonly name: string;
    readonly desc: string;
    readonly version: string;
    readonly author: string;
    readonly entry: string;
}

export default class Plugin {
    readonly meta: PluginMeta;

    constructor(meta: PluginMeta) {
        this.meta = meta;
    }
}
