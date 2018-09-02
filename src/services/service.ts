import Bot from "../core/bot";
import Fragment from "../fragments/fragment";

export interface ServiceOptions {
    readonly name: string;
    readonly description?: string;
    readonly enabled: (bot: Bot, api?: any) => void;
    readonly disabled?: (bot: Bot, api?: any) => void;
    readonly canEnable?: (bot: Bot, api?: any) => boolean;
    readonly listeners?: Array<string>;
}

export default abstract class Service extends Fragment {
    readonly disabled?: (bot: Bot, api?: any) => void;
    readonly canEnable: ((bot: Bot, api?: any) => boolean) | boolean = true;
    readonly listeners: Array<string> = [];

    /**
     * @param {ServiceOptions} options
     */
    protected constructor(options: ServiceOptions) {
        super();
    }

    abstract enabled(bot: Bot, api?: any): void;
}
