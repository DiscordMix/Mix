import DiscordEvent from "../core/discordEvent";
import {DecoratorUtils} from "./decoratorUtils";
import {DecoratorProxy} from "./component";

export enum EventListenerType {
    Once,
    On
}

export interface IEventListener {
    readonly type: EventListenerType;

    readonly event: DiscordEvent;

    invoker(...args: any): void;
}

export const eventListeners: IEventListener[] = [];

/**
 * Invoke target method once when the specified event occurs.
 */
export function once(event: DiscordEvent): DecoratorProxy {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        eventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}

/**
 * Invoke target method every time the specified event occurs.
 */
export function on(event: DiscordEvent): DecoratorProxy {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        eventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}
