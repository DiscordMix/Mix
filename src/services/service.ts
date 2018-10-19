import Bot from "../core/bot";
import {IFragment, IFragmentMeta} from "../fragments/fragment";

export interface ServiceOptions {
    readonly bot: Bot;
    readonly api?: any;
}

export default abstract class Service<ApiType = undefined | any> implements IFragment {
    public abstract meta: IFragmentMeta;
    public readonly stop?: () => void;
    public readonly canStart: (() => boolean) | boolean = true;

    // TODO: Is this being used?
    public readonly listeners: string[] = [];

    protected readonly bot: Bot;
    protected readonly api: ApiType;

    /**
     * @param {ServiceOptions} options
     */
    protected constructor(options: ServiceOptions) {
        /**
         * @type {Bot}
         * @readonly
         */
        this.bot = options.bot;

        /**
         * @type {ApiType}
         * @readonly
         */
        this.api = options.api;
    }

    public abstract start(): void;
}
