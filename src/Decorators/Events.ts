import DiscordEvent from "../Core/DiscordEvent";
import {DecoratorUtils} from "./DecoratorUtils";
import {DecoratorProxy} from "./Component";

export enum EventListenerType {
    Once,
    On
}

export interface IEventListener {
    readonly type: EventListenerType;
    readonly event: DiscordEvent;

    invoker(...args: any): void;
}

export const EventListeners: IEventListener[] = [];

/**
 * Invoke target method once when the specified event occurs.
 */
export function Once(event: DiscordEvent): DecoratorProxy {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        EventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}

/**
 * Invoke target method every time the specified event occurs.
 */
export function On(event: DiscordEvent): DecoratorProxy {
    return function (target: any, prop: string) {
        DecoratorUtils.ensureFunc(target[prop]);

        EventListeners.push({
            invoker: target[prop],
            type: EventListenerType.Once,
            event
        });
    };
}
