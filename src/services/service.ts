import Bot from "../core/bot";
import Fragment from "../fragments/fragment";

export interface ServiceOptions {
    readonly bot: Bot;
    readonly api?: any;
}

export default abstract class Service<ApiType = any> extends Fragment {
    public readonly stop?: () => void;
    public readonly canStart: (() => boolean) | boolean = true;
    public readonly listeners: string[] = [];

    protected readonly bot: Bot;
    protected readonly api?: ApiType;

    /**
     * @param {ServiceOptions} options
     */
    protected constructor(options: ServiceOptions) {
        super();

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
