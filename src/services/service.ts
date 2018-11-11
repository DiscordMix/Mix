import Bot from "../core/bot";
import {IFragment, IFragmentMeta} from "../fragments/fragment";
import {IDisposable, DiscordEvent} from "..";

export interface IServiceOptions {
    readonly bot: Bot;
    readonly api?: any;
}

export default abstract class Service<ApiType = undefined | any> implements IFragment, IDisposable {
    public abstract meta: IFragmentMeta;
    public readonly stop?: () => void;
    public readonly canStart: (() => boolean) | boolean = true;
    public readonly listeners: Map<DiscordEvent, any>;

    protected readonly bot: Bot;
    protected readonly api: ApiType;

    /**
     * @todo Just accept bot and api, no need for Options obj
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

        /**
         * @type {Map<DiscordEvent, *>}
         * @readonly
         */
        this.listeners = new Map();
    }

    protected on(event: DiscordEvent, handler: any): this {
        this.bot.client.on(event, handler);
        this.listeners.set(event, handler);

        return this;
    }

    public dispose(): void {
        for (let [event, handler] of this.listeners) {
            this.bot.client.removeListener(event, handler);
        }
    }

    public abstract start(): void;
}
