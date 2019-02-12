import Bot from "../core/bot";
import DiscordEvent from "../core/discord-event";
import {GenericService, IService, IServiceOptions} from "./generic-service";
import {IMeta} from "../fragments/fragment";

export default abstract class Service extends GenericService implements IService {
    public readonly meta: IMeta = {
        // Leave empty intentionally so the fragment validator complains.
        name: ""
    };

    public readonly listeners: Map<DiscordEvent, any>;

    protected readonly bot: Bot;

    // TODO: Just accept bot and api, no need for Options obj.
    protected constructor(options: IServiceOptions) {
        super();

        this.bot = options.bot;
        this.listeners = new Map();
    }

    public dispose(): void {
        for (const [event, handler] of this.listeners) {
            this.bot.client.removeListener(event, handler);
        }
    }

    /**
     * Whether the service is running.
     */
    public get running(): boolean {
        // TODO: This is just template-future-code (does NOT work!).
        // ... Need someway to check if the service is actually running (not just saved + stopped).
        return this.bot.services.contains(this.meta.name);
    }

    protected on(event: DiscordEvent, handler: any): this {
        this.bot.client.on(event, handler);
        this.listeners.set(event, handler);

        return this;
    }
}
