import Bot from "../core/bot";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import {IDisposable} from "..";

export interface IServiceOptions {
    readonly bot: Bot;
    readonly api?: any;
}

export default abstract class Service<ApiType = undefined | any> implements IFragment, IDisposable {
    public abstract meta: IFragmentMeta;
    public readonly stop?: () => void;
    public readonly canStart: (() => boolean) | boolean = true;

    // TODO: Is this being used?
    public readonly listeners: string[] = [];

    protected readonly bot: Bot;
    protected readonly api: ApiType;

    /**
     * @param {IServiceOptions} options
     */
    protected constructor(options: IServiceOptions) {
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

    public dispose(): void {
        //
    }

    public abstract start(): void;
}
